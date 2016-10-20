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

@yearly_genres = Array.new
@yearly_tempo = Array.new
@yearly_valence = Array.new

def find_track_id(artist, track)
  a = nil

  begin
    t = RSpotify::Base.search("#{artist} #{track}", "track").find do |t|
      String::Similarity.cosine(track, t.name) >= 0.65
    end

    unless t.nil?
      a = t.artists.find do |a|
        String::Similarity.cosine(artist, a.name) >= 0.65
      end
    end
  rescue
    return {
      artist: artist,
      track: track
    }
  end

  unless t.nil? || a.nil?
    f = t.audio_features.attributes
    genres = a.genres
    @yearly_genres += genres
    @yearly_tempo.push(f[:tempo])
    @yearly_valence.push(f[:valence])

    {
      artist: artist,
      track: track,
      spotify_artist: a.name,
      spotify_track: t.name,
      time_sig: f[:time_signature],
      tempo: f[:tempo],
      valence: f[:valence],
      mode: f[:mode],
      key: f[:key],
      energy: f[:energy],
      duration: f[:duration_ms],
      genres: a.genres,
      popularity: t.popularity,
      preview: t.preview_url
    }
  else
    {
      artist: artist,
      track: track
    }
  end
end

for year in 2015..2015 do
  data = Array.new
  begin
    bill = RestClient.get("http://billboardtop100of.com/#{year}-2/")
  rescue
    next
  end

  begin
    wiki = RestClient.get("https://en.wikipedia.org/wiki/#{year}_in_music")
  rescue
    wiki = nil
  end

  bill_doc = Nokogiri::HTML(bill.body)
  wiki_doc = Nokogiri::HTML(wiki.body)

  tracks = Array.new
  artists = Array.new

  bill_doc.css('table tbody td[2]').each do |a|
    artists.push(a.text.strip)
  end

  bill_doc.css('table tbody td[3]').each do |a|
    tracks.push(a.text.strip.sub(/\nLYRICS/, ''))
  end

  events = wiki_doc.at_xpath("//div[@id='mw-content-text']/ul[1]").to_html

  yearly_data = artists.zip(tracks).map do |i|
    find_track_id(i[0], i[1])
  end

  File.open("#{year}.json","w") do |f|
    f.puts JSON.pretty_generate({
      "#{year}" => {
        genres: Hash.new(0).tap { |h| @yearly_genres.each { |word| h[word] += 1 } },
        events: events,
        avg_tempo: @yearly_tempo.grep(Float).reduce(:+) / @yearly_tempo.size.to_f,
        avg_valence: @yearly_valence.grep(Float).reduce(:+) / @yearly_valence.size.to_f,
        songs: yearly_data
      }
    })
  end

  puts "#{year} finished"
  @yearly_genres = Array.new
  @yearly_tempo = Array.new
  @yearly_valence = Array.new
end
