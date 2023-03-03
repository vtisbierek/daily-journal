exports.trimText = function(post){
    let trimmedText = {
        content: "",
        display: "",
    };
    if(post.length < 100){
        trimmedText.content = post;
        trimmedText.display = "invisible";
    } else{
        trimmedText.content = post.substring(0,100) + " ... ";
        trimmedText.display = "visible";
    }
    return trimmedText;
};