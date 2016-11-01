# Development Instructions
**Do not commit to master branch!**

Create a branch with your initials and a title e.g:
`git checkout -b cr-add-boilerplate`

When you're done making changes open a PR to master

# Website
No installation necessary! Current version can be found at [hvpm.surge.sh](https://hvpm.surge.sh).

If you insist on running locally you can do so with python's simpleHTTPserver or similar.

# Citations
Lynch, S., Haber, J., & Carpendale, S. (2012). Colourvis: Exploring colour in digital images. Computers & Graphics, 36(6), 696-707.

# Responsibilities

  * Visualization to compare current selection to total by valence
    - Brian Hamilton
  * Heirachical Edge Bundling
    - Xing Li & Mac Carter
  * Video
    - Mac Carter
  * Stacked Area / Legend / Styling
    - Cody Roberts

# About
The goal of this visualization was to aesthetically present the emotional changes in popular
American music over time.  The target audience is the general public.  We feel we did a decent
job giving a general overview, but we're unable to drill down and give meaningful insights at the
year level.  

As for the data, we scraped Billboard Top 100 data for 1956 to 2015. We then used this list to query
for valence (emotional feeling of a song) and other meta data from Spotify's API.

We liked the appeal of ColourVis (cited above) and thought it would fit nicely into this visualization. 
We used this idea to create a vertical stacked area chart that categorized songs of each year into one
of 5 categories based on their valence. The smaller histogram like visualization compares valence of
the selection on the stacked area chart to the overall dataset, allowing one to make meaningful comparisons
on a selection of the users choosing. The heirachical edge bundling visualization was aimed at giving
a yearly view of the songs joined by valence.  Unfortunately we ran into some performance problems and
couldn't get it to work very well.  At the vary least, it gives us the songs of a specific year and with
the addition of a music player, one can compare songs of different categories.

After completing the stacked area chart, I (Cody) realized that a streamgraph might have been a bit more
interesting.  We could have used another metric, like unemployment, for the width of the chart to provide
a perhaps more meaningful visualization.

For the bar chart to the left of the page, we thought it would be nice to see the the overall distribution of 
valences based on the selection made on the stacked area chart. The bar chart resizes and updates the 
oercentage of songs that are in a given valence group in the selection.

The final graph in the middle is an modified hierarchal edge bundle graph. The graph's beta is set to 0 since
I(Xing) thought that it would better represent the different valence areas. The slider below the graph is
set to the years in the stacked area chart selection. Each node of the the graph can be clicked to bring the
song to the music player so that you can listen to the song.

This visualization offers both a high level overview of the data with the bar chart and the stacked area chart
and the hierarchy edge bundle graph offer a much more detailed view of valence data along with the songs so that you
can discover songs based on the their valence and listen to it.

After finishing the hierarchal edge graph. I(Xing) realized we probably could've added a couple more metrics
(ie. genre to further delineate the songs, connections could be between genres the color of the lines could've represented
the valences) However, the genres were very messy using the spotify API, and there was no good way to grab the correct
the genre without going to another source.. 

# License
This project is released under GNU GPLv3
