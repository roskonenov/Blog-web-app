const truncateText = (text, charLimit = 100) => {
    if (text?.length > charLimit) {
        return text.slice(0, charLimit) + '...';
    }
    return text;
};

export default truncateText;