require 'json'

data = Array.new

for year in 1950..2015
  begin
    File.open("./data/#{year}.json", "r") do |f|
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

      total = counts.reduce(0) do |t, i|
        t + i[1]
      end

      counts = counts.map do |k, v|
        if total > 0
          perct = v / total.to_f
          [k, perct]
        else
          [k, 0.0]
        end
      end

      c = {
        "#{year}" => {
          saddest: counts[0][1],
          sad: counts[1][1],
          neutral: counts[2][1],
          happy: counts[3][1],
          happiest: counts[4][1]
        }
      }

      data.push c
    end
  rescue
    nil
  end
end

File.open("data.json","w") do |f|
  f.puts JSON.pretty_generate(data.reduce({}, :merge))
end
