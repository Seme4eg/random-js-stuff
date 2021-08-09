const response = window.prompt(
  "Relist ALL rivens? Type 'n' to relist manually. Y/n"
);

document.querySelectorAll(".actionbar").forEach(async (bar, index, arr) => {
  if (response === "y" || response === "Y") {
    await relist(bar, true);
    if (index === arr.length - 1) {
      window.location.reload(false);
      window.alert("Done, sir!");
    }
  } else {
    const relistButtonHtml = createElementFromHTML(
      `<button style="width:50px;height:24px;font-weight:100;margin:0 8px;border-radius:5px;font-size: 13px;line-height:1;letter-spacing:1px;vertical-align:top;">Relist</button>`
    );
    relistButtonHtml.onclick = relist;
    bar.append(relistButtonHtml);
  }
});

// 2nd argument determines how to obtain 'attrs'
async function relist(el, auto = false) {
  const attrs = auto
    ? el.parentElement.attributes
    : el.target.parentElement.parentElement.attributes;

  const payload = {
    platprice: attrs["data-price"].value,
    sell: "SELL",
    veiled: null,
    type: attrs["data-wtype"].value,
    next: "true",
    weapon: attrs["data-weapon"].value,
    stat1: attrs["data-stat1"].value,
    stat2: attrs["data-stat2"].value,
    stat3: attrs["data-stat3"].value,
    stat4: attrs["data-stat4"].value,
    stat1amount: attrs["data-stat1val"].value,
    stat2amount: attrs["data-stat2val"].value,
    stat3amount: attrs["data-stat3val"].value,
    stat4amount: attrs["data-stat4val"].value,
    name: attrs["data-name"].value,
    polarity: attrs["data-polarity"].value,
    rerolls: attrs["data-rerolls"].value,
    rank: attrs["data-rank"].value,
    mastery: attrs["data-mr"].value,
  };

  await deleteRivenCopy(attrs["id"].value.split("_")[1]);

  await fetch("https://riven.market/sell", {
    method: "POST",
    body: Object.entries(payload)
      .map((pair) => pair[0] + "=" + pair[1])
      .join("&"),
    headers: { "Content-type": "application/x-www-form-urlencoded" },
  });
}

function createElementFromHTML(htmlString) {
  var d = document.createElement("div");
  d.innerHTML = htmlString.trim();
  return d.firstChild;
}

async function deleteRivenCopy(rivenId) {
  await fetch(
    `${php_baseurl}_php/ajax.php?updateriven=${rivenId}&state=deleted&time=${+Date.now()}`,
    { method: "GET" }
  );
  removeRiven(rivenId);
}
