/**
 * Check wether the specified password is compliant with the radius requirements
 * @param {string} password 
 * @returns true if password is valid
 */
const isPasswordValid = (password) => {
    let forbiddenCharacters = ["à", "é", "è", "ê", "ë", "ô", "î", "ö", "ï", "ç", "ù", "û", "ü", "ä", "â", "ñ"];
    let isValid = password.split('').reduce((accumulator, current) => {
        if(!accumulator)
            return false;
        else {
            let inArray = false;
            forbiddenCharacters.forEach((character) => {
                if(current === character)
                    inArray = true;
            });

            return !inArray;
        }
    }, true);

    return isValid;
};

module.exports = { isPasswordValid };