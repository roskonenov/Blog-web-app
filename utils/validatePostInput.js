import isValidImageURL from "./isValidImageURL.js";

export default function validatePostInput({ subject, title, imageURL, text }) {
    const errors = {};

    if (!subject || subject.length < 3) {
        errors.subject = "'Subject' must be at least 3 characters!";
    }

    if (!title || title.length < 6) {
        errors.title = "'Title' must be at least 6 characters!";
    }

    if (!imageURL || !isValidImageURL(imageURL)) {
        errors.imageURL = "Please enter valid image URL!"
    }

    if (!text || text.length < 200) {
        errors.text = "Your post must be at least 200 characters!"
    }

    return {
        errors,
        oldInput: { subject, title, imageURL, text }
    }
}