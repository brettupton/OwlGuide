export const convertTitleCase = (str: string): string => {
    let words = str.toLowerCase().split(/\s+/);

    for (let i = 0; i < words.length; i++) {
        if (words[i].includes('-')) {
            let parts = words[i].split('-');
            for (let j = 0; j < parts.length; j++) {
                parts[j] = parts[j].charAt(0).toUpperCase() + parts[j].slice(1);
            }
            words[i] = parts.join('-');
        } else {
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
        }
    }

    return words.join(' ')
}