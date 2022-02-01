
export var settings = {
    apiKey: null,
    username: null,
    password: null,
}

export const verify = {
    username: (value) => value.match(/^[\d\w-]{4,24}$/g) !== null,
    password: (value) => value.match(/^[\d\w-?$/!"'+*§]{8,32}$/g) !== null,
}


