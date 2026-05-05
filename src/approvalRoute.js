export function buildApprovalRoute(documentType, stepNumber, approverUserId) {
  return { documentType: documentType, stepNumber: stepNumber, approverUserId: approverUserId };
}

export function getRoutesByDocumentType(routes, documentType) {
  return routes
    .filter(function(r) { return r.documentType === documentType; })
    .sort(function(a, b) { return a.stepNumber - b.stepNumber; });
}

export function addRouteStep(routes, documentType, approverUserId) {
  var existing = getRoutesByDocumentType(routes, documentType);
  var nextStep = existing.length > 0
    ? Math.max.apply(null, existing.map(function(r) { return r.stepNumber; })) + 1
    : 1;
  return routes.concat([buildApprovalRoute(documentType, nextStep, approverUserId)]);
}

export function removeRouteStep(routes, documentType, stepNumber) {
  return routes.filter(function(r) {
    return !(r.documentType === documentType && r.stepNumber === stepNumber);
  });
}

export function updateRouteStep(routes, documentType, stepNumber, approverUserId) {
  return routes.map(function(r) {
    if (r.documentType === documentType && r.stepNumber === stepNumber) {
      return buildApprovalRoute(documentType, stepNumber, approverUserId);
    }
    return r;
  });
}
