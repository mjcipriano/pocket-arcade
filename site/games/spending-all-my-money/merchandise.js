// Each department has three products. Existing product IDs stay in their original order.
const extraDepartments=[
 ['Rain Check','Outerwear',[
 ['🧥','Waxed field jacket',96,2,'Cotton canvas, storm placket and snap cuffs','The cuffs kept my sleeves dry on a wet commute.','The wax finish needs brushing after a muddy walk.'],
 ['☂️','Compact storm umbrella',32,1,'Eight ribs and a vented double canopy','The vent helped on a windy street corner.','A little bulky in a small shoulder bag.'],
 ['🥾','Chelsea rain boots',64,2,'Pull tabs, rubber shell and removable insoles','I rinsed off the whole muddy garden in seconds.','Thick socks make the ankle feel snug.']]],
 ['Gallery Opening','Clothing',[
 ['🧥','Linen blazer',92,2,'Unstructured linen with patch pockets','The soft shoulders worked over a plain tee.','It creases when folded in a suitcase.'],
 ['👚','Ribbed knit top',34,1,'Cotton rib knit with a bound neckline','The neckline stayed flat after washing.','I lay it flat to dry to keep its length.'],
 ['👖','Pleated trousers',68,1,'High waist, belt loops and a tapered leg','Deep pockets held my phone comfortably.','I needed to shorten the hem.']]],
 ['Sunday Ride','Cycling',[
 ['🚲','City bicycle',185,3,'Steel step-through frame and rear rack','The low frame makes a loaded grocery run easier.','It is heavy to carry up stairs.'],
 ['⛑️','Commuter helmet',48,1,'Dial fit with adjustable chin strap','The dial is easy to tighten with one hand.','My ponytail sits lower underneath it.'],
 ['🎒','Roll-top pannier',54,2,'Clip-on rack hooks and a welded liner','My lunch stayed upright on the rack.','Check your rack diameter before buying.']]],
 ['Bread Day','Kitchenware',[
 ['⚖️','Digital kitchen scale',30,1,'One-gram increments and tare button','Taring the bowl makes feeding my starter simple.','A dinner plate covers part of the display.'],
 ['🥣','Proofing basket',28,1,'Round cane basket with washable liner','It left tidy rings on my first sourdough.','Flour the liner well for wet dough.'],
 ['🍞','Serrated bread knife',46,1,'Offset handle and 20 cm blade','The teeth slice crust without crushing the loaf.','It takes up a long slot in my drawer.']]],
 ['Night Train','Travel',[
 ['🧳','Weekender duffel',78,2,'Canvas body with reinforced handles','The wide opening makes packing easy.','It has no separate shoe pocket.'],
 ['🧣','Travel wrap',38,1,'Soft brushed weave and hemmed edges','It doubles as a blanket on a cold train.','The loose weave can catch on jewelry.'],
 ['🧴','Travel flask',24,1,'350 mL steel body and screw cap','It fits the narrow pocket on my bag.','The opening takes small ice cubes only.']]],
 ['Court Club','Sportswear',[
 ['👕','Piqué polo',42,1,'Cotton piqué with a two-button collar','The collar holds its shape after a match.','It runs short through the body.'],
 ['🩳','Court shorts',36,1,'Stretch waistband and two ball pockets','Both pockets actually hold tennis balls.','The drawstring is on the inside.'],
 ['👟','Canvas court shoes',58,2,'Low-top canvas with flat rubber soles','The flat sole feels steady on hard courts.','I added insoles for longer walks.']]],
 ['Listening Room','Audio',[
 ['🎛️','Belt-drive turntable',145,2,'Manual cue lever and replaceable stylus','The cue lever lands gently on the first track.','You have to lift the arm at the end.'],
 ['💿','Record cleaning kit',22,1,'Carbon brush and lint-free cloth','The brush reaches the surface dust easily.','The cloth needs its own clean pouch.'],
 ['🔊','Bookshelf speaker',89,2,'Passive two-way cabinet with grille','Voices came through clearly in my small room.','You need a separate amplifier.']]],
 ['Pavement Studio','Art supplies',[
 ['✏️','Graphite pencil tin',18,1,'Six grades with a hinged steel case','The softer grades shade without much pressure.','The soft tips need frequent sharpening.'],
 ['📔','Pocket sketch pad',15,1,'A6 stitched book with textured paper','It fits a jacket pocket with room for a pen.','Wet washes buckle the thin pages.'],
 ['👜','Canvas tool roll',29,1,'Twelve stitched pockets and tie closure','The ties keep my pencils from spilling.','My thick marker barely fits a pocket.']]],
 ['Trailhead','Outdoor gear',[
 ['🎒','Day hiking pack',72,2,'18 L capacity with a sternum strap','The chest strap kept the load still downhill.','The rain cover is sold separately.'],
 ['🧭','Baseplate compass',25,1,'Clear base and map ruler','I can see the trail through the baseplate.','The markings are tiny in low light.'],
 ['🧢','Five-panel trail cap',28,1,'Quick-dry fabric and rear buckle','The brim packs flat in a side pocket.','The shallow crown fits close.']]],
 ['Writing Desk','Stationery',[
 ['🖋️','Fountain pen',44,1,'Fine steel nib and converter','The fine line works on small planner squares.','Let the ink dry before closing the book.'],
 ['📒','Dot-grid journal',21,1,'Numbered pages and lay-flat binding','The index makes meeting notes easy to find.','Very wet ink shows through slightly.'],
 ['🗃️','Letter tray',26,2,'Stackable tray sized for A4 paper','Two trays stack neatly on my desk.','It takes up more space than a folder.']]]
];
const dyeNames=['Ink','Ivory','Moss','Clay','Ocean','Plum','Marigold','Cherry'];
const inks=['#283646','#e6ddc4','#63724b','#b87254','#38758b','#85577d','#cc941e','#a64147'];
const grades=['Everyday','Select','Rare','Archive'];
const finishes=['Classic','Studio','Heritage','Atelier'];
function lot(id,delivery,seed){
 let n=(Math.imul(id+7,2654435761)^Math.imul(delivery+1,2246822519)^seed)>>>0;
 function draw(){n=(n+0x6D2B79F5)>>>0;let t=Math.imul(n^(n>>>15),1|n);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;}
 const roll=draw(), dye=draw();
 const color=[.22,.41,.57,.71,.82,.90,.96,1].findIndex(limit=>dye<limit);
 return {color,grade:roll<.62?0:roll<.87?1:roll<.97?2:3,edition:delivery+1};
}
const legacyProfiles=[
 ['LED beam with wrist loop','Fits my glove box','The loop is snug over gloves'],
 ['Steel folding frame','Packs flat behind the seat','The seat feels firm'],
 ['Insulated picnic box','Two lunch boxes fit side by side','The lid needs room to swing'],
 ['Glazed stoneware','The handle fits three fingers','It takes up a wide shelf spot'],
 ['Whole medium-roast beans','Smells nutty straight out of the grinder','You need a grinder'],
 ['Narrow stainless spout','Easy to aim over a paper filter','Filling through the lid takes time'],
 ['Coated palms','Good grip on damp pots','The cuffs run short'],
 ['Live potted sweet basil','The leaves smell wonderful','It wants a sunny window'],
 ['Long angled spout','Reaches under the leaves','The handle needs hanging space'],
 ['Padded over-ear cups','Comfortable through a whole album','Warm in the afternoon'],
 ['Telescopic aerial','Found my local station easily','The tuning wheel is small'],
 ['Desktop stand included','Sits steady during a call','The stand picks up desk taps'],
 ['Six engraved dice','Pips are easy to read','They roll far on bare wood'],
 ['Linen-textured deck','Shuffles smoothly','The tuck box fits tightly'],
 ['Folding wooden board','Pieces fit inside for travel','The light pawns tip easily'],
 ['Six mixed brush tips','The fine tip holds a point','Dry the handles before packing'],
 ['Twelve half pans','The lid works as a mixing palette','The wells are shallow'],
 ['Spiral bound drawing paper','Lies flat on my lap','Wet ink can show through'],
 ['Seasoned cast iron','Browns the edges evenly','Heavy to lift one-handed'],
 ['Adjustable burr grinder','A quarter turn gives a fine grind','The fill opening is narrow'],
 ['Three beechwood spoons','Comfortable stirring a thick sauce','Hand washing takes extra time'],
 ['Tinted lenses with soft case','The hinges fold smoothly','The case offers little crush protection'],
 ['Tilting shade canopy','Easy to angle in the afternoon','Bring a separate sand anchor'],
 ['Molded sandals','Dry quickly after the beach','The straps feel firm at first'],
 ['Compact socket and driver set','Sockets snap back into place','The handle is short for tight bolts'],
 ['Retractable steel tape','The lock holds while marking shelves','The markings are small'],
 ['Mixed metric fasteners','The clear jar shows what is left','Sort the sizes before starting'],
 ['35 mm film body','The advance lever feels precise','Loading takes a little practice'],
 ['Standing frame with glass front','Easy to swap the print','The stand needs a deep shelf'],
 ['36 exposure color film','Plenty of frames for a day out','Remember to budget for developing'],
 ['Woven wool with fringed ends','Warm around the collar','The fringe catches on zips'],
 ['Adjustable cotton twill','The buckle stays put','The crown fits close'],
 ['Ribbed cotton blend','They stay up on long walks','Air drying takes a while'],
 ['Two paperback mysteries','Small enough for a train ride','The print is compact'],
 ['Single-wick candle in a jar','Gives my reading corner a soft glow','The first burn takes patience'],
 ['Adjustable reading arm','I can aim the light away from the screen','The base needs some desk space']
];

// Collector releases follow the original catalog so saved product IDs stay stable.
const collectorReleases=[
 ['Darkroom Cabinet','Photography',1,[
 ['🎞️','Expired slide film',32,1,'36 exposures of reversal film','I like experimenting with the color shifts.','Results vary between rolls.'],
 ['📷','Brass rangefinder',220,2,'Mechanical shutter and coupled focus','The focus patch is easy to align.','The brass body is quite heavy.'],
 ['🔍','Contact sheet loupe',46,1,'Five-power glass optic','Frame details pop on the light table.','Fingerprints show on the base.']]],
 ['Weekend Florist','Gardening',2,[
 ['💐','Ranunculus bunch',35,1,'Ten freshly cut stems','The buds opened over several days.','They wilt without fresh water.'],
 ['🏺','Stoneware bud vase',48,1,'Hand-thrown narrow neck','One stem stands upright.','The opening needs a small brush.'],
 ['✂️','Florist snips',29,1,'Spring-loaded bypass blades','They cut thin stems cleanly.','Dry the hinge after rinsing.']]],
 ['First Pressing','Audio',3,[
 ['💽','Numbered jazz pressing',115,1,'180 g vinyl in a numbered sleeve','The liner notes tell the story of the session.','The sleeve corners mark easily.'],
 ['🎚️','Phono preamp',120,1,'Switchable gain and ground terminal','My turntable finally plays at line level.','Check the cartridge setting first.'],
 ['🪮','Stylus brush',18,1,'Short fibers on a handled brush','Easy to guide from back to front.','The handle is small.']]],
 ['Tea Merchant','Kitchenware',4,[
 ['🍵','Spring sencha tin',38,1,'First-flush leaves in a sealed tin','A short steep tastes grassy and sweet.','The fragrance fades after opening.'],
 ['🫖','Side-handle teapot',89,2,'Glazed pot with basket strainer','The handle balances well when pouring.','The mesh takes time to rinse.'],
 ['🥄','Bamboo tea scoop',16,1,'Carved bamboo with a curved tip','Slides neatly into the tea tin.','Keep it dry between uses.']]],
 ['Watchmaker’s Bench','Hardware',6,[
 ['⌚','Hand-wound dress watch',295,1,'Mechanical movement with a small seconds dial','Winding the crown is a lovely daily ritual.','It stops if left on the shelf.'],
 ['🔎','Watchmaker eyeglass',34,1,'Lightweight ten-power loupe','Engraving looks razor sharp.','The working distance is short.'],
 ['🧰','Spring bar tool',24,1,'Forked tip with a knurled handle','Swapping straps takes seconds.','The fine tip needs a steady hand.']]],
 ['Cartographer’s Drawer','Stationery',8,[
 ['🗺️','Numbered transit lithograph',135,1,'Signed print on cotton rag paper','The route colors look great under glass.','Handle the margins with clean hands.'],
 ['📐','Brass map divider',65,1,'Friction hinge and needle points','Settings hold across repeated measurements.','The points need a case.'],
 ['📜','Archival map tube',36,2,'Rigid tube with removable end caps','Wide enough to roll my print loosely.','It needs a long shelf.']]]
];
