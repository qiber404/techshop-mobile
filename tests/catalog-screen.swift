import Foundation
import Vision

// Verify visible content from a Release launch with the embedded bundle and local database.
let image = URL(fileURLWithPath: CommandLine.arguments[1])
let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
request.usesLanguageCorrection = false
try VNImageRequestHandler(url: image).perform([request])
let text = (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }
    .joined(separator: " ").lowercased()
print(text)
exit(text.contains("techshop") && text.contains("solocast") ? 0 : 1)
