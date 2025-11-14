export const parseViewportString = (str: string) => {
  const regex = /(?<regionName>.+):(?<start>.+)-(?<end>.+)/;
  const match = regex.exec(str);

  if (!match?.groups) {
    throw "Wrong query";
  }

  const { regionName, start, end } = match.groups;

  return {
    regionName,
    start: parseInt(start),
    end: parseInt(end)
  }
};