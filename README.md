# Development Instructions
**Do not commit to master branch!**

Create a branch with your initials and a title e.g:
`git checkout -b cr-add-boilerplate`

When you're done making changes open a PR to master

# Website
No installation necessary! Current version can be found at [https://hvpm.surge.sh]("hvpm.surge.sh").

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
