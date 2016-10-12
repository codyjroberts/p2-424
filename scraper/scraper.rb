require 'rubygems'
require 'mechanize'
require 'nokogiri'
require 'json'

a = Mechanize.new
data = Array.new
for year in 1950..2015 do
  page = a.get("http://billboardtop100of.com/#{year}-2/")

  doc = Nokogiri::HTML(page.body)

  songs = Array.new
  artists = Array.new

  doc.css('table tbody td[2]').each do |a|
    artists.push(a.text)
  end

  doc.css('table tbody td[3]').each do |a|
    songs.push(a.text)
  end

  yearly_data = artists.zip(songs).map do |i|
    {
      artist: i[0],
      song: i[1]
    }
  end

  data.push({
    "#{year}" => yearly_data
  })
end

File.open("../data.json","w") do |f|
  f.puts JSON.pretty_generate(data)
end
