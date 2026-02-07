// function extractPathnameSegments(path) {
//   const splitUrl = path.split('/');

//   return {
//     resource: splitUrl[1] || null,
//     id: splitUrl[2] || null,
//   };
// }

// function constructRouteFromSegments(pathSegments) {
//   let pathname = '';

//   if (pathSegments.resource) {
//     pathname = pathname.concat(`/${pathSegments.resource}`);
//   }

//   if (pathSegments.id) {
//     pathname = pathname.concat('/:id');
//   }

//   return pathname || '/';
// }

// export function getActivePathname() {
//   return location.hash.replace('#', '') || '/';
// }

// export function getActiveRoute() {
//   const pathname = getActivePathname();
//   const urlSegments = extractPathnameSegments(pathname);
//   return constructRouteFromSegments(urlSegments);
// }

// export function parseActivePathname() {
//   const pathname = getActivePathname();
//   return extractPathnameSegments(pathname);
// }

// export function getRoute(pathname) {
//   const urlSegments = extractPathnameSegments(pathname);
//   return constructRouteFromSegments(urlSegments);
// }

// export function parsePathname(pathname) {
//   return extractPathnameSegments(pathname);
// }

const UrlParser = {
  parseActiveUrlWithCombiner() {
    const url = window.location.hash.slice(1).toLowerCase();
    const splitedUrl = this._urlSplitter(url);
    return this._urlCombiner(splitedUrl);
  },

  parseActiveUrlWithoutCombiner() {
    const url = window.location.hash.slice(1).toLowerCase();
    return this._urlSplitter(url);
  },

  _urlSplitter(url) {
    const urlsSplits = url.split("/");
    return {
      resource: urlsSplits[1] || null,
      id: urlsSplits[2] || null,
      verb: urlsSplits[3] || null,
    };
  },

  _urlCombiner(splitedUrl) {
    return (
      (splitedUrl.resource ? `/${splitedUrl.resource}` : "/") +
      (splitedUrl.id ? "/:id" : "") +
      (splitedUrl.verb ? `/${splitedUrl.verb}` : "")
    );
  },
};

export default UrlParser;
