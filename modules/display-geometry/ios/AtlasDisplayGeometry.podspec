Pod::Spec.new do |s|
  s.name = 'AtlasDisplayGeometry'
  s.version = '1.0.0'
  s.summary = 'Scene-local display geometry for Guitar Atlas'
  s.description = s.summary
  s.license = { :type => 'MIT' }
  s.author = 'Guitar Atlas'
  s.homepage = 'https://github.com/chrismcqueen/guitar-note-atlas'
  s.platforms = { :ios => '16.4' }
  s.source = { :path => '.' }
  s.static_framework = true
  s.swift_version = '5.9'
  s.source_files = '**/*.swift'
  s.dependency 'ExpoModulesCore'
end
