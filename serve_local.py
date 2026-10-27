import http.server, socketserver
PORT = 8080
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        super().end_headers()
with socketserver.TCPServer(('', PORT), H) as httpd:
    print('Serving on http://localhost:%d' % PORT)
    httpd.serve_forever()