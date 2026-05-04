export function generateProjectCode(existingCodes) {
  const re = /^PJ-(\d{5})$/;
  const nums = existingCodes
    .map(function (code) {
      const match = code.match(re);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(function (n) { return n > 0; });
  const max = nums.length > 0 ? Math.max.apply(null, nums) : 0;
  return 'PJ-' + String(max + 1).padStart(5, '0');
}

export function findProjectByCode(projects, code) {
  return projects.find(function (p) { return p.code === code; }) || null;
}

export function filterProjectsByStatus(projects, statuses) {
  if (!statuses || !statuses.length) return projects;
  return projects.filter(function (p) {
    return statuses.indexOf(p.status) >= 0;
  });
}

export function filterProjectsByName(projects, keyword) {
  if (!keyword || !keyword.trim()) return projects;
  const lower = keyword.toLowerCase();
  return projects.filter(function (p) {
    return p.name.toLowerCase().indexOf(lower) >= 0 ||
           p.code.toLowerCase().indexOf(lower) >= 0;
  });
}

export function createProject(formData) {
  return {
    code: formData.code,
    name: formData.name,
    customerId: formData.customerId,
    department: formData.department,
    status: formData.status,
    startDate: formData.startDate,
    dueDate: formData.dueDate,
    description: formData.description
  };
}
