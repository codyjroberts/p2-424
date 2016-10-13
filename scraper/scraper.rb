require 'rubygems'
require 'nokogiri'
require 'json'
require 'rspotify'
require 'string/similarity'

RSpotify.authenticate("15499d6284c6489c9d0ae77d517d8d06", "8b0f2babe93a4a3b8f77ce02a97ddb75")

class RSpotify::AudioFeatures
  def attributes
    instance_variables.map do |var|
      [var[1..-1].to_sym, instance_variable_get(var)]
    end.to_h
  end
end

def find_track_id(artist, track)
  t = RSpotify::Base.search("#{artist} #{track}", "track").find do |t|
    String::Similarity.cosine(track, t.name) >= 0.75
  end

  unless t.nil?
    a = t.artists.find do |a|
      String::Similarity.cosine(artist, a.name) >= 0.75
    end
  end

  unless t.nil? || a.nil?
    features = t.audio_features.attributes
    {
      artist: artist,
      track: track,
      features: features
    }
  else
    {
      artist: artist,
      track: track,
      features: nil
    }
  end
end

for year in 1999..2015 do
  data = Array.new
  page = RestClient.get("http://billboardtop100of.com/#{year}-2/")

  doc = Nokogiri::HTML(page.body)

  tracks = Array.new
  artists = Array.new

  doc.css('table tbody td[2]').each do |a|
    artists.push(a.text)
  end

  doc.css('table tbody td[3]').each do |a|
    tracks.push(a.text)
  end

  yearly_data = artists.zip(tracks).map do |i|
    result = find_track_id(i[0], i[1])
    next if result == nil
    result
  end

  File.open("#{year}.json","w") do |f|
    f.puts JSON.pretty_generate({"#{year}" => yearly_data})
  end
  puts "#{year} finished"
end
