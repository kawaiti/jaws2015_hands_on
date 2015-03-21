require 'aws-sdk'
require 'fluent-logger'
require 'json'
require 'optparse'

options = {fluent_host: "localhost", fluent_port: 24224 }
OptionParser.new do |opt|
  opt.on('--stream name', 'stream name') {|v| options[:stream_name] = v }
  opt.on('--tag tag', 'tag for Fluentd') {|v| options[:tag] = v }
  opt.on('--host [host]', 'fluentd host') {|v| options[:fluent_host] = v }
  opt.on('--port [port]', 'fluentd port') {|v| options[:fluent_port] = v }
  begin
    opt.parse!(ARGV)
  rescue
    opt.to_s
  end
end

Fluent::Logger::FluentLogger.open(nil, host: options[:fluent_host], port: options[:fluent_port])
kinesis = Aws::Kinesis::Client.new(region: 'ap-northeast-1')


shards = kinesis.describe_stream(stream_name: options[:stream_name]).stream_description.shards
shards_ids = shards.map(&:shard_id)

shards_ids.each do |shard_id|
  shard_iterator_info = kinesis.get_shard_iterator(stream_name: options[:stream_name], shard_id: shard_id, shard_iterator_type: 'LATEST') 
  shard_iterator = shard_iterator_info.shard_iterator
  loop do
    records_info = kinesis.get_records(shard_iterator: shard_iterator)
    records_info.records.each do |record|
      hash = JSON.parse(record.data)
      hash[:stream_name] = options[:stream_name]
      puts hash
      Fluent::Logger.post(options[:tag], hash)
    end
    shard_iterator = records_info.next_shard_iterator
  end
end

