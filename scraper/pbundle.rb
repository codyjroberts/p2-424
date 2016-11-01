require 'json'

File.open("data.json", "r") do |f|
  d = JSON.parse File.read(f)

  songs = d.map do |k, v|
    v["songs"].map do |s|
      s["year"] = k
      valence = s["valence"]
      v_ranges = { unknown: 2, happiest: 0.8, happy: 0.6, neutral: 0.4, sad: 0.2, saddest: 0 } 


      (s["valence"] == 0.0 || s["valence"].nil?) ? valence = 2 : valence = s["valence"]

      {
        artist: s["artist"],
        track: s["track"],
        preview: s["preview"],
        category: v_ranges.find { |k, v| valence >= v }[0],
        valence: valence,
        year: k
      } 
    end
  end.flatten

  data = {
    categories: {
      happiest: songs.select { |s| s[:category] == :happiest },
      happy: songs.select { |s| s[:category] == :happy },
      neutral: songs.select { |s| s[:category] == :neutral },
      sad: songs.select { |s| s[:category] == :sad },
      saddest: songs.select { |s| s[:category] == :saddest },
      unknown: songs.select { |s| s[:category] == :unknown }
    },
    songs: songs
  }

  File.open("bundles.json","w") do |b|
    b.puts JSON.pretty_generate(data)
  end
end
