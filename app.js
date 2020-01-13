// code is refactored and never checked after it, 1kk% it is not working, saved it jus to remeber ^^
// but it did it's job before being refactored

const puppeteer = require('puppeteer'),
      http = require('https'),
      fs = require('fs')

(async () => {
  const browser = await puppeteer.launch(),
        page = await browser.newPage()

  await page.setCookie(...cookies)
  await page.goto('https://www.bluesharmonica.com/lessons_by_level')

  const pages = await getPages(page);

  let obj = {rootDir: 'C:/Users/lunin/Documents/_harmonica/node/', ...pages}

  createDir(obj)

  for (const [name, url] of Object.entries(obj.pages)) {
    await page.goto(url) // open new page

    const names = await getVidNames(page)
    const links = getVidUrls() // some params there
    // getting file names + file urls
    const fileLinks = await getFileNameUrl(page);
    // creating file system and downloading files
    var download = createFileStructure(url, dest, cb)

    downloadFiles(fileLinks, obj, name)
    downloadVids(fileLinks, obj, name)
  }

  await browser.close()

})()

function createDir(obj) {
  fs.mkdir(obj.rootDir + obj.mainDir, () => {
    for (const [name, url] of Object.entries(obj.pages))
      fs.mkdir(obj.rootDir + obj.mainDir + '/' + name, () =>
               fs.mkdir(obj.rootDir + obj.mainDir + '/' + name + '/files', (err) => err && console.log(err)))
  })
}

function getPages(page) {
  return page.evaluate(i => {
    let resObj = {},
        elem = document.querySelectorAll('.views-view-grid')[i]

    resObj.mainDir = 'lesson ' + (i < 10 ? 0 + '' + i : i)
    resObj.pages = {}

    // creating child dirs + filling links arr
    elem.querySelectorAll('.views-field-title .field-content a').forEach((link, j, arr) => {
      resObj.pages[(((arr.length > 9) ? '0' + j : j) + ' ' + link.innerHTML)] = link.href
    })

    return Promise.resolve(resObj)
  }, 0)
}

function getFileNameUrl(page) {
  return page.evaluate(() => {
    let tempObj = {}
    for (let link of document.querySelectorAll('.field-content div a'))
      tempObj[link.innerHTML.replace(/[\/\\:"\*\?\<\>\|]/g, '')]
      = link.href
    return Promise.resolve(tempObj)
  })
}

function getVidNames(page) {
  return page.evaluate(() => {
    let folderNames = []
    document.querySelectorAll('.item-list.views-accordion')
      .forEach((node, i) => node.querySelectorAll('a.thickbox')
               .forEach((link, j) => folderNames
                        .push(i + '' + j + ' ' + node.querySelector('h3').innerHTML.replace(/[\/\\:"\*\?\<\>\|]/g, '')
                              + ' -- ' + (link.innerHTML + '.mp4').replace(/[\/\\:"\*\?\<\>\|]/g, ''))))
    return Promise.resolve(folderNames)
  })
}

function createFileStructure(url, dest, cb) {
  return new Promise ((res, rej) => {
    var file = fs.createWriteStream(dest)
    var request = http.get(url, function(response) {
      response.pipe(file)
      file.on('finish', function() {
        file.close(cb)  // close() is async, call cb after close completes.
        res()
      })
    }).on('error', function(err) { // Handle errors
      fs.unlink(dest) // Delete the file async. (But we don't check the result)
      if (cb) cb(err.message)
      rej()
    })
  })
}

function downloadFiles(fileLinks, obj, name) {
  for (let [fileName, url] of Object.entries(fileLinks)) {
    download(
      url,
      obj.rootDir + obj.mainDir + '/' + name + '/files/' + fileName,
      (msg = 'file downloaded') => console.log(msg)
    )
  }
}

function downloadVids(links, obj, name) {
  links.forEach((link, i) => download(
    link,
    obj.rootDir + obj.mainDir + '/' + name + '/' + names[i],
    (msg = 'video downloaded') => console.log(msg)
  ))
}

function getVidUrls() {
  let links = []
  for (const child of page.mainFrame().childFrames()) {
    let obj = await child.content().then(str =>
                                         JSON.parse(str.match(/\{"cdn_url".*"vimeo.com"\}/)[0]))
    for (const file of obj.request.files.progressive) {
      if (file.quality === '720p') {
        links.push(file.url)
        break
      }
      if (file.quality === '540p') {
        links.push(file.url)
        break
      }
    }
  }
  return links
}


let cookies = [
  {
    name     : '__utmz',   /* required property */
    value    : '255082971.1551544491.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none)',  /* required property */
    domain   : '.bluesharmonica.com',
    path     : '/',                /* required property */
    expires  : (new Date()).getTime() + (1000 * 60 * 60)   /* <-- expires in 1 hour */
  },
  {
    name     : '__utma',   /* required property */
    value    : '255082971.1360920854.1551544491.1551731172.1551773878.6',  /* required property */
    domain   : '.bluesharmonica.com',
    path     : '/',                /* required property */
    expires  : (new Date()).getTime() + (1000 * 60 * 60)   /* <-- expires in 1 hour */
  },
  {
    name     : '__utmb',   /* required property */
    value    : '255082971.4.10.1551544491',  /* required property */
    domain   : '.bluesharmonica.com',
    path     : '/',                /* required property */
    expires  : (new Date()).getTime() + (1000 * 60 * 60)   /* <-- expires in 1 hour */
  },
  {
    name     : '__utmc',   /* required property */
    value    : '255082971',  /* required property */
    domain   : '.bluesharmonica.com',
    path     : '/',                /* required property */
    expires  : (new Date()).getTime() + (1000 * 60 * 60)   /* <-- expires in 1 hour */
  },
  {
    name     : '__utmt',   /* required property */
    value    : '1',  /* required property */
    domain   : '.bluesharmonica.com',
    path     : '/',                /* required property */
    expires  : (new Date()).getTime() + (1000 * 60 * 60)   /* <-- expires in 1 hour */
  },
  {
    name     : '__utmv',   /* required property */
    value    : '255082971.|1=User%20roles=authenticated%20user%2CSubscriber%20(Monthly)%2CHohner=1',  /* required property */
    domain   : '.bluesharmonica.com',
    path     : '/',                /* required property */
    expires  : (new Date()).getTime() + (1000 * 60 * 60)   /* <-- expires in 1 hour */
  },
  {
    name     : 'SESS81337e990a83514f31a18cfb785cb2ad',   /* required property */
    value    : 'shnc4i5gkaov9150o4p2gucrr5',  /* required property */
    domain   : '.bluesharmonica.com',
    path     : '/',                /* required property */
    expires  : (new Date()).getTime() + (1000 * 60 * 60)   /* <-- expires in 1 hour */
  },
  {
    name     : 'SESSa7954104e19b6f70074c899171c69ffd',   /* required property */
    value    : '2ga5gp0o2diiubcglbeg4pu7i4',  /* required property */
    domain   : '.bluesharmonica.com',
    path     : '/',                /* required property */
    expires  : (new Date()).getTime() + (1000 * 60 * 60)   /* <-- expires in 1 hour */
  },
]
