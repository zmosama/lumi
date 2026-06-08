export function generateCsv(data: any[]): string {
  if (!data || !data.length) {
    return '';
  }

  const header = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj)
      .map(value => {
        // Handle strings that contain commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(',')
  );

  return [header, ...rows].join('\n');
}
