## Using docker

This is the method of using the full application. It means you can
update the data served and also add your own backend connections, data
workflows and more by leveraging the power of R langague.

It also means you would need some knowledge of R to be able to write
such data workflows. The
[`plumber`](https://github.com/rstudio/plumber/) package (now owned by
RStudio) is rather new and the stable release came out in
[Sep 2020](https://github.com/rstudio/plumber/releases/tag/v1.0.0). The
Dockerfile has gone through few versions and this should be expected as
underlying libraries change and grow.

Currently the ready to use (with default dataset) images are hosted at.

## Outside the browser

Compiling JS applications to WebAssembly (Haas et al. 2017) is becoming
main stream and there are application which not only facilitate this but
also provide frameworks to run applications like the eAtlas on natively
bypassing browsers. One of these solutions is called Tauri (“What Is
Tauri? Tauri Studio” n.d.), the developers introduce it as “Tauri is a
toolkit that helps developers make applications for the major desktop
platforms - using virtually any frontend framework in existence.”

In our experience, running the application in WebAssembly provided at
least 3x performance boost over Firefox, Chrome and Safari. We were able
to load 3.5m crash points in a Tauri run eAtlas `v.1.0.0-beta.1` `dmg`
app on macOS Big Sur with 16GB RAM. `<TODO: add instructions to
reproduce this somehwere>`
