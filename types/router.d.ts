/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/auth/classes`; params?: Router.UnknownInputParams; } | { pathname: `/auth/home`; params?: Router.UnknownInputParams; } | { pathname: `/types/class`; params?: Router.UnknownInputParams; } | { pathname: `/types`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `/auth/classes`; params?: Router.UnknownOutputParams; } | { pathname: `/auth/home`; params?: Router.UnknownOutputParams; } | { pathname: `/types/class`; params?: Router.UnknownOutputParams; } | { pathname: `/types`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `/auth/classes${`?${string}` | `#${string}` | ''}` | `/auth/home${`?${string}` | `#${string}` | ''}` | `/types/class${`?${string}` | `#${string}` | ''}` | `/types${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/auth/classes`; params?: Router.UnknownInputParams; } | { pathname: `/auth/home`; params?: Router.UnknownInputParams; } | { pathname: `/types/class`; params?: Router.UnknownInputParams; } | { pathname: `/types`; params?: Router.UnknownInputParams; };
    }
  }
}
