// A $( document ).ready() block.
$(document).ready(function() {

    // DropCap.js
    var dropcaps = document.querySelectorAll(".dropcap");
    window.Dropcap.layout(dropcaps, 2);

    // Responsive-Nav
    var nav = responsiveNav(".nav-collapse");

    // Round Reading Time
    $(".time").text(function(index, value) {
        return Math.round(parseFloat(value));
    });

});


// anchor on headings
var anchorForId = function(id) {
    var anchor = document.createElement("a");
    anchor.className = "header-link";
    anchor.href = "#" + id;
    anchor.innerHTML = "<i class=\"fa fa-link\"></i>";
    return anchor;
};

var linkifyAnchors = function(level, containingElement) {
    var headers = containingElement.getElementsByTagName("h" + level);
    for (var h = 0; h < headers.length; h++) {
        var header = headers[h];

        if (typeof header.id !== "undefined" && header.id !== "") {
            header.appendChild(anchorForId(header.id));
        }
    }
};

document.onreadystatechange = function() {
    if (this.readyState === "complete") {
        var contentBlock = document.getElementsByClassName("js-anchors")[0];
        if (!contentBlock) {
            return;
        }
        for (var level = 1; level <= 6; level++) {
            linkifyAnchors(level, contentBlock);
        }
    }
};

// counter on external posts
document.onreadystatechange = function() {
    if (this.readyState === "complete") {
        const sections = document.getElementsByClassName("external-section");
        if (!sections) {
            return;
        }

        for(var i = 0; i < sections.length; i++) {
            const section = sections[i];

            const badge = section.getElementsByClassName("js-badge")[0]
            const count = section.getElementsByTagName("ul")[0].children.length 

            badge.innerHTML = `(${count})`
        }
    }
};
