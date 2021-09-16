/**
 * Go to playlist page -> open console -> copy & run this script
 * Go to 'network' tab in console -> clear it -> in 'Filter' field type 'playlist'
 * On page that opened to you - swap first two tracks -> Save changes
 * In console there gonna be 1 xhr request -> RMC -> Copy -> Copy as fetch
 * Paste in console -> Enter
 * Done
 */

(function async() {
  const fetchCopy = window.fetch;

  openEditTracklist();

  window.fetch = async (url, options) => {
    await openEditTracklist(); // first open 'edit tracks' tab

    const { playlist } = JSON.parse(options.body);

    // swap 1st & 2nd track ids due to required step above
    const t = playlist.tracks[0];
    playlist.tracks[0] = playlist.tracks[1];
    playlist.tracks[1] = t;

    playlist.tracks = [
      ...document.querySelectorAll('.editTrackList__list.sc-list-nostyle li'),
    ]
      .map((el, i) => ({ id: playlist.tracks[i], el }))
      .sort((elemA, elemB) => {
        const selector =
          '.editTrackItem__content.sc-media-content span.sc-link-light';
        const nameA = elemA.el.querySelector(selector).innerText.toLowerCase();
        const nameB = elemB.el.querySelector(selector).innerText.toLowerCase();
        if (nameA < nameB) return -1;
        else if (nameA > nameB) return 1;
        return 0;
      })
      .map(el => el.id);

    playlist.track_count === playlist.tracks.length &&
      fetchCopy(url, {
        ...options,
        body: JSON.stringify({ playlist }),
      }).then(() => window.location.reload());

    window.fetch = fetchCopy;
  };

  function openEditTracklist() {
    return new Promise(res => {
      document.querySelector('.sc-button-edit').click();

      // any other way to know if everything is loaded and 'tracks' tab
      // is clickable ?
      setTimeout(() => {
        document.querySelector('.g-tabs .g-tabs-item:nth-child(2) a').click();
        setTimeout(res, 1000);
      }, 1500);
    });
  }
})();

/**
 * Reasons why realisation is that bad:
 *
 * SC doesn't show track ids in it's html, they r prob stored in application
 * store. Therefore i couldn't have avoided step with making a useless request
 * and 'copyin payload' from it.
 *
 * In 'Edit -> Tracks' menu of playlist u can't rearrange HTML nodes and press
 * 'Save changes' cuz SC has some events / data bound to those nodes, which u
 * for some reason loose even if u don't touch its innerHTML and just use
 * {parent}.prepend() / {parent}.appendChild(). Even using XPath to get an
 * element and insert it to the beginning of track list doesn't work. And you
 * don't have an option to look under the hood.
 *
 * And you can't emitate (or at least i didn't find a way) drag'n'drop with js.
 */
