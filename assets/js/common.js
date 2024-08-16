$(document).ready(function () {
    // add toggle functionality to abstract, award and bibtex buttons
    $("a.abstract").click(function () {
        $(this).parent().parent().find(".abstract.hidden").toggleClass("open");
        $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
        $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
    });
    $("a.award").click(function () {
        $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
        $(this).parent().parent().find(".award.hidden").toggleClass("open");
        $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
    });
    $('a.bibtex').click(function () {
        $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
        $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
        $(this).parent().parent().find(".bibtex.hidden").toggleClass("open");
    });
    $('a').removeClass('waves-effect waves-light');
});
