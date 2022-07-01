const replaceAll = (str: string, search: string, replace: string) => {
  return str.split(search).join(replace);
};

const isMacAdress = (MacAddress: string) => {
  const regex = /^([0-9A-F]{2}){5}([0-9A-F]{2})$/;

  return regex.test(MacAddress);
};

export const MacAdressVerification = (MacAddress: string) => {
  const newMacAddress = replaceAll(
    replaceAll(replaceAll(replaceAll(MacAddress, '-', ''), ':', ''), ' ', ''),
    ';',
    '',
  ).toUpperCase();
  const Verification = isMacAdress(newMacAddress);

  if (Verification) return newMacAddress;
  else return '';
};
