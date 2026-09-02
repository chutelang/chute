// Extracts the full Siri Shortcuts action catalog from WorkflowKit (and
// optionally ActionKit) via Objective-C runtime introspection. The action
// definitions are constructed in code inside the frameworks — there is no
// plist or data file on disk — so runtime loading is the only way to read them.
//
// Build (macOS-only, 338 actions):
//   clang -fobjc-arc -framework Foundation -o extract extract-actions.m
//
// Build (iOS simulator, 390 actions — requires Xcode):
//   SDK=$(xcrun --sdk iphonesimulator --show-sdk-path)
//   clang -arch arm64 -isysroot "$SDK" -mios-simulator-version-min=17.0 \
//         -DLOAD_ACTIONKIT -fobjc-arc -framework Foundation \
//         -o extract extract-actions.m
//
// Run:
//   ./extract out.json                    # macOS build
//   xcrun simctl spawn <UDID> ./extract out.json  # simulator build

#import <Foundation/Foundation.h>
#import <objc/runtime.h>
#import <objc/message.h>
#import <dlfcn.h>

#define SEND ((id (*)(id, SEL))objc_msgSend)
#define MAX_DEPTH 12

// Recursively converts runtime objects into JSON-serializable Foundation types.
//
// Three wrinkles the runtime data throws at us:
//   1. String values are often _NSLocalizedStringResource, not NSString.
//      Calling -localize resolves them to plain strings.
//   2. WFParameterDefinition, WFActionDescriptionDefinition, etc. each wrap
//      a plain NSDictionary in a _definition ivar — unwrap and recurse.
//   3. WFActionParameterSummary has no _definition ivar. For those (and any
//      other WF* object), we fall back to generic ivar reflection.
static id sanitize(id value, int depth) {
    if (!value || [value isKindOfClass:[NSNull class]]) {
        return [NSNull null];
    }
    if (depth > MAX_DEPTH) {
        return @"<max-depth>";
    }

    // Primitives — pass through
    if ([value isKindOfClass:[NSString class]] ||
        [value isKindOfClass:[NSNumber class]]) {
        return value;
    }

    // Collections — recurse into elements
    if ([value isKindOfClass:[NSArray class]]) {
        NSMutableArray *result = [NSMutableArray array];
        for (id item in value) {
            [result addObject:sanitize(item, depth + 1)];
        }
        return result;
    }
    if ([value isKindOfClass:[NSDictionary class]]) {
        NSMutableDictionary *result = [NSMutableDictionary dictionary];
        [(NSDictionary *)value enumerateKeysAndObjectsUsingBlock:
            ^(id key, id obj, __unused BOOL *stop) {
                result[[key description]] = sanitize(obj, depth + 1);
            }];
        return result;
    }

    // Binary data / URLs — serialize to string
    if ([value isKindOfClass:[NSData class]]) {
        return [(NSData *)value base64EncodedStringWithOptions:0];
    }
    if ([value isKindOfClass:[NSURL class]]) {
        return [value absoluteString];
    }

    // Wrinkle 1: _NSLocalizedStringResource → call -localize
    if ([value respondsToSelector:sel_registerName("localize")] &&
        [value respondsToSelector:sel_registerName("key")]) {
        id localized = SEND(value, sel_registerName("localize"));
        if ([localized isKindOfClass:[NSString class]]) {
            return localized;
        }
    }

    // Wrinkle 2: WF*Definition wrappers → unwrap _definition ivar
    Ivar definitionIvar = class_getInstanceVariable(object_getClass(value), "_definition");
    if (definitionIvar) {
        id inner = object_getIvar(value, definitionIvar);
        if (inner) {
            return sanitize(inner, depth + 1);
        }
    }

    // Class objects → class name string
    if (object_isClass(value)) {
        return [NSString stringWithUTF8String:class_getName(value)];
    }

    // Wrinkle 3: generic fallback — dump object ivars for WF* types
    Class cls = object_getClass(value);
    unsigned int ivarCount = 0;
    Ivar *ivars = class_copyIvarList(cls, &ivarCount);

    if (ivarCount > 0) {
        NSMutableDictionary *result = [NSMutableDictionary dictionary];
        result[@"__class"] = [NSString stringWithUTF8String:class_getName(cls)];

        for (unsigned int i = 0; i < ivarCount; i++) {
            const char *encoding = ivar_getTypeEncoding(ivars[i]);
            if (encoding[0] != '@') continue;

            const char *name = ivar_getName(ivars[i]);
            id ivarValue = object_getIvar(value, ivars[i]);
            if (!ivarValue) continue;

            NSString *key = [NSString stringWithUTF8String:(name[0] == '_' ? name + 1 : name)];
            result[key] = sanitize(ivarValue, depth + 1);
        }

        free(ivars);
        return result;
    }

    free(ivars);
    return [NSString stringWithFormat:@"<%s>", object_getClassName(value)];
}

int main(int argc, char **argv) {
    @autoreleasepool {
        if (argc < 2) {
            fprintf(stderr, "usage: %s <out.json>\n", argv[0]);
            return 2;
        }

#ifdef LOAD_ACTIONKIT
        // ActionKit must load FIRST so its definitions register before we
        // read the registry.
        //
        // On macOS this aborts — ActionKit refuses to load into a process
        // Apple did not sign. Only build with -DLOAD_ACTIONKIT for the iOS
        // simulator target.
        void *actionKit = dlopen(
            "/System/Library/PrivateFrameworks/ActionKit.framework/ActionKit",
            RTLD_NOW);
        fprintf(stderr, "ActionKit:   %s\n", actionKit ? "OK" : dlerror());
#endif

        void *workflowKit = dlopen(
            "/System/Library/PrivateFrameworks/WorkflowKit.framework/WorkflowKit",
            RTLD_NOW);
        fprintf(stderr, "WorkflowKit: %s\n", workflowKit ? "OK" : dlerror());

        Class Registry = NSClassFromString(@"WFActionDefinitionRegistry");
        SEND(Registry, sel_registerName("rediscoverDefinitionsIfNeeded"));
        NSDictionary *registeredDefinitions = SEND(Registry, sel_registerName("registeredDefinitions"));

        NSMutableDictionary *output = [NSMutableDictionary dictionary];
        int succeeded = 0;
        int failed = 0;

        NSArray *sortedKeys = [[registeredDefinitions allKeys]
            sortedArrayUsingSelector:@selector(compare:)];

        for (NSString *identifier in sortedKeys) {
            @try {
                // Each value is a factory block — call it to get a WFActionDefinition
                id factoryBlock = registeredDefinitions[identifier];
                id definition = ((id (^)(void))factoryBlock)();
                if (!definition) {
                    failed++;
                    continue;
                }

                Ivar defIvar = class_getInstanceVariable(
                    object_getClass(definition), "_definition");
                id rawDict = defIvar ? object_getIvar(definition, defIvar) : nil;
                if (!rawDict) {
                    failed++;
                    continue;
                }

                NSMutableDictionary *entry = [sanitize(rawDict, 0) mutableCopy];
                entry[@"Identifier"] = [identifier description];
                output[[identifier description]] = entry;
                succeeded++;
            }
            @catch (id exception) {
                failed++;
            }
        }

        fprintf(stderr, "extracted=%d failed=%d\n", succeeded, failed);

        NSError *error = nil;
        NSData *jsonData = [NSJSONSerialization
            dataWithJSONObject:output
                       options:NSJSONWritingPrettyPrinted | NSJSONWritingSortedKeys
                         error:&error];

        if (!jsonData) {
            fprintf(stderr, "JSON error: %s\n", [[error description] UTF8String]);
            return 1;
        }

        NSString *outputPath = [NSString stringWithUTF8String:argv[1]];
        [jsonData writeToFile:outputPath atomically:YES];
        return 0;
    }
}
