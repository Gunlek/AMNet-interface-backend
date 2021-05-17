const replaceAll = (str, search, replace) => {
    return str.split(search).join(replace);
}

module.exports = { replaceAll };