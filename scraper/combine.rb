require 'json'

data = Array.new

for year in 1950..2015
  begin
    File.open("#{year}.json", "r") do |f|
      data.push JSON.parse(File.read(f))
    end
  rescue
    nil
  end
end

File.open("data.json","w") do |f|
  f.puts JSON.pretty_generate(data.reduce({}, :merge))
end
