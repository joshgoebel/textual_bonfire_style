# Bonfire

Bonfire is a nice and light theme for Textual based around the same asthetics as
37signals' popular [Campfire](http://campfirenow.com) chat web service.  Dark sides
can be turned on and off with `Darken main window colors` check box in preferences.
I just happen to like them dark, so that's what I used for the sample snap.

![What it looks like](https://raw.github.com/yyyc514/textual_bonfire_style/master/bonfire_snap.png)

## Textual 3.x

I've recently improved the theme to handle server and channel events so that when you are looking at a channel or server window it will be very clear if you are not joined to the channel or have been disconnected from the server.  This was one of my few gripes about Textual before.

## Textual 2.1.1 or newer required

The `master` branch now only supports Textual 2.1.1 and newer because of the recent [theme engine
changes][theme_engine].  If you aren't using 2.1.1 or newer yet please see the instructions below for Older Versions below.

[theme_engine]: https://github.com/Codeux/Textual/wiki/Style-Developers:-Migrating-to-2.1.1

### Installation

    cd ~/Library/Containers/com.codeux.textual/Data/Library/
    cd Application\ Support/Textual\ IRC/Styles/
    git clone git://github.com/yyyc514/textual_bonfire_style.git

Now go choose your new theme inside Textual.

<a name="older"></a>
## Older Versions

### Textual 2.1 (from App Store)

Use the [textual_21](https://github.com/yyyc514/textual_bonfire_style/tree/textual_21) branch
of this repository.

### Installation

I'm no longer running 2.1, the Styles path might be slightly different than shown here.

    cd ~/Library/Containers/com.codeux.textual/Data/Library/
    cd Application\ Support/Textual\ IRC/Styles/
    git clone git://github.com/yyyc514/textual_bonfire_style.git
    cd textual_bonfire_style
    git checkout textual_21


Go choose your new theme inside Textual.