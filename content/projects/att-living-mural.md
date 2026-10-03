TITLE: AT&T Living Mural
YEAR: 2025
CLIENT: AT&T
CLIENT URL:
LOCATION: Mercedes-Benz Stadium, Atlanta, GA
FEATURED: yes

DISCIPLINES: Lighting Design, Interactive Installation, Creative Technology
SCOPE: Creative technology lead — system architecture, pixel mapping, integration

SUBTITLE:
A permanent LED sculpture at Mercedes-Benz Stadium that maps where fans traveled from

BODY:
AT&T commissioned a permanent artwork for Mercedes-Benz Stadium. Living Walls brought in Zoo as Zoo, an Atlanta studio working across art, design, fashion, music, and technology, who proposed a light installation driven by the fans themselves.

AT&T's message is about connecting people, so the piece asks one question: where are you coming from? Fans scan a QR code, enter their zip code, and watch the mural respond. The sculpture is built from vertical and spiral LED forms, each representing a part of metro Atlanta. Visitors from outside the metro register the direction they traveled from, and international guests have their own entry. Over time the wall becomes a live portrait of who fills the stadium and how far they came.

Robi Abera built the web portal, which uses a nearest-neighbor algorithm to find the closest path from each zip code to the stadium. Entries travel over WebSockets to TouchDesigner, developed by Bryan Snigur, which acts as the media server and sends textures to ENTTEC ELM. ELM drives Advatek pixel controllers.

The spirals were the fun problem. Using ELM's spline tool, we mapped each spiral so textures could be projected across it like a flat LED tile, letting us design motion for the whole sculpture as one canvas.

OUTCOME:
Permanent installation, running since summer 2025.

COLLABORATORS:
Zoo as Zoo — Artist — Atlanta
Living Walls — Curation
Robi Abera — Web development
Bryan Snigur — TouchDesigner development
Chemistry Creative — Production, fabrication, install
Acres Agency — Photo and video

STACK: Custom web app (Heroku), WebSockets, TouchDesigner, ENTTEC ELM, Advatek pixel controllers
MATERIALS: Vertical and spiral LED forms
CREDIT: Creative technology led by Pablo Gnecco as Creative Technology Lead at Chemistry Creative. Produced, fabricated, and installed by Chemistry Creative.
THANKS:
MEDIA:
