// use fetch to retrieve json file and report any errors that occur
fetch('./items.json').then(response => {
  if (response.ok) {
    response.json().then(json => {
      data = json;

      document.getElementById("search-form").onsubmit = () => {
        document.getElementById("search-message").innerHTML = "";
        document.getElementById("search-results").innerHTML = "";
        searchterm = document.getElementById("search-term").value;
        searchtermlower = searchterm.toLowerCase();
        searchtermlength = searchterm.length;
        j = 0;

        for (i = 0; i < data.length; i++) {
          datalower = (data[i].item.titleInfo_title).toLowerCase();

          if (datalower.includes(searchtermlower)) {
            document.getElementById("search-results").innerHTML += `<li><a href="./item.html?id=${data[i].item.recordInfo_recordIdentifier}"><img alt="${data[i].item.titleInfo_title}" src="${data[i].item.identifier}" /></a><p>${data[i].item.titleInfo_title}</p><p>${data[i].item.abstract}</p><p>${data[i].item.extension}</p><p>${data[i].item.originInfo_dateIssued}</p></li>`;
            j++;
          }
        }

        document.getElementById("search-message").innerHTML += `Your search for <em>${searchterm}</em> has ${j} result(s)`;
        return false;
      }
    });
  } else {
    console.log(`Request for items.json failed with response ${response.status}: ${response.statusText}`);
  }
});
