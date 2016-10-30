require 'json'

data = Array.new

for year in 1956..2015
  begin
    File.open("#{year}.json", "r") do |f|
      d = JSON.parse File.read(f)
      songs = d["#{year}"]["songs"]

      counts = [
        ["saddest", 0.2],
        ["sad", 0.4],
        ["neutral", 0.6],
        ["happy", 0.8],
        ["happiest", 1.0]
      ].map do |k, v|
        v = v.to_f

        count = songs.select do |s|
          s["valence"].to_f == 0.0 ? false : s["valence"].to_f.between?(v - 0.2, v)
        end

        [k, count.count]
      end

      c = {
        year: year,
        saddest: counts[0][1],
        sad: counts[1][1],
        neutral: counts[2][1],
        happy: counts[3][1],
        happiest: counts[4][1]
      }

      data.push c
    end
  rescue => exception
    warn exception.message
  end
end

File.open("../brian.json","w") do |f|
  f.puts JSON.pretty_generate(data)
end
