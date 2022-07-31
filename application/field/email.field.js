module.exports = {
    label: "E-mail",
    title: "E-mail",
    description: null,
    type: "email",
    step: null,
    values: null,
    defaultValue: null,
    helpMessage: "myemail@email.com",
    placeholder: "E-mail",
    format: {
        value: /^[a-zA-Z\d\._\-]+@[a-zA-Z\d\-]+(?:\.[a-zA-Z\d_\-]+)*$/,
        message: "Le format de l'e-mail est incorrect."
    },
    required: {
        value: true,
        message: "L'e-mail est obligatoire."
    },
    min: {
        value: null,
        message: null
    },
    max: {
        value: null,
        message: null
    },
    minLength: {
        value: 7,
        message: "L'e-mail doit comporter au moins 7 caractères."
    },
    maxLength: {
        value: 128,
        message: "L'e-mail est limité à 128 caractères."
    },
    messages: {
        EmailIdNotFound: "Une erreur technique s'est produite.<br/><br/>Si cette erreur persiste, veuillez contacter notre équipe @todo:SITE_NAME depuis le <a href=\"/contact\" title=\"Formulaire de contact\">formulaire de contact</a>.<br/><br/>Soyez assuré(e) que nous mettrons tous les moyens nécessaires pour répondre à votre demande dans les plus brefs délais.<br/><br/>A bientôt,<br/>L'équipe @todo:SITE_NAME.",
        EmailNotFound: "E-mail introuvable.",
        DisposableEmail: "E-mail jetable non autorisé.",
        EmailDuplication: "E-mail déjà existant.",
        BusinessEmailRequired: "L'e-mail doit être composé du même nom de domaine que celui de l'entreprise.",
        TemplateEmailNotFound: "L'envoi de votre e-mail d'activation est impossible. N'hésitez pas à réessayer ultérieurement.<br/><br/>Soyez assuré(e} que nous mettrons tous les moyens nécessaires pour répondre à votre demande dans les plus brefs délais.<br/><br/>A bientôt,<br/>L'équipe @todo:SITE_NAME.",
        SendEmailImpossible: "Envoi d'e-mail impossible. N'hésitez pas à réessayer ultérieurement.<br/><br/>Soyez assuré(e} que nous mettrons tous les moyens nécessaires pour répondre à votre demande dans les plus brefs délais.<br/><br/>A bientôt,<br/>L'équipe @todo:SITE_NAME.",
        AccountNotActive: "Votre compte a été désactivé. Pour le réactiver, veuillez nous <a href=\"/contact\" title=\"Contact\">contacter</a>.<br/><br/>A bientôt,<br/>L'équipe @todo:SITE_NAME."
    }
};