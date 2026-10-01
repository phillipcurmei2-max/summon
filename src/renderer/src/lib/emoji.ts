/** A curated set of the emoji people actually reach for, with search keywords. */

export interface Emoji {
  char: string
  name: string
  keywords: string
  group: string
}

const DATA: Record<string, string> = {
  Smileys: `
😀 grinning face|smile happy
😃 grinning face with big eyes|smile happy joy
😄 grinning face with smiling eyes|smile happy laugh
😁 beaming face|grin teeth happy
😆 grinning squinting face|laugh lol
😅 grinning face with sweat|relief nervous phew
🤣 rolling on the floor laughing|rofl lol lmao
😂 face with tears of joy|lol laugh crying funny
🙂 slightly smiling face|smile ok
🙃 upside-down face|silly sarcasm
😉 winking face|wink flirt
😊 smiling face with smiling eyes|blush happy
😇 smiling face with halo|angel innocent
🥰 smiling face with hearts|love adore crush
😍 heart eyes|love crush
🤩 star-struck|wow amazing excited
😘 face blowing a kiss|kiss love
😋 face savoring food|yum delicious tongue
😛 face with tongue|tongue playful
😜 winking face with tongue|crazy silly
🤪 zany face|crazy wild goofy
🤑 money-mouth face|rich money dollar
🤗 hugging face|hug thanks
🤭 face with hand over mouth|oops giggle
🫢 face with open eyes and hand over mouth|shock gasp
🤫 shushing face|quiet secret shh
🤔 thinking face|hmm think wonder
🫡 saluting face|salute respect yes sir
🤐 zipper-mouth face|secret quiet
🤨 face with raised eyebrow|suspicious skeptical
😐 neutral face|meh blank
😑 expressionless face|meh annoyed
😶 face without mouth|speechless silent
🫠 melting face|melt hot embarrassed
😏 smirking face|smirk smug
😒 unamused face|meh unimpressed
🙄 face with rolling eyes|eyeroll whatever
😬 grimacing face|awkward yikes
😮‍💨 face exhaling|sigh relief phew
🤥 lying face|liar pinocchio
😌 relieved face|calm content
😔 pensive face|sad thoughtful
😪 sleepy face|tired
🤤 drooling face|drool want
😴 sleeping face|sleep zzz tired
😷 face with medical mask|sick mask ill
🤒 face with thermometer|sick fever ill
🤢 nauseated face|sick gross
🤮 face vomiting|sick gross puke
🥵 hot face|hot heat sweating
🥶 cold face|cold freezing
🥴 woozy face|drunk dizzy
😵 face with crossed-out eyes|dizzy dead
🤯 exploding head|mind blown shocked
🤠 cowboy hat face|cowboy yeehaw
🥳 partying face|party celebrate birthday
🥸 disguised face|disguise incognito
😎 smiling face with sunglasses|cool sunglasses
🤓 nerd face|nerd geek glasses
🧐 face with monocle|inspect fancy
😕 confused face|confused unsure
😟 worried face|worried concerned
🙁 slightly frowning face|sad frown
😮 face with open mouth|wow surprised
😯 hushed face|surprised
😲 astonished face|shocked amazed
😳 flushed face|embarrassed blush
🥺 pleading face|please puppy eyes
🥹 face holding back tears|touched grateful emotional
😦 frowning face with open mouth|shock
😨 fearful face|scared fear
😰 anxious face with sweat|nervous anxious
😢 crying face|sad tear
😭 loudly crying face|sob cry sad
😱 face screaming in fear|scream horror omg
😖 confounded face|frustrated
😣 persevering face|struggle
😞 disappointed face|sad disappointed
😓 downcast face with sweat|stress
😩 weary face|tired exhausted
😫 tired face|exhausted
🥱 yawning face|yawn bored tired
😤 face with steam from nose|triumph angry huff
😡 enraged face|angry mad rage
😠 angry face|angry mad
🤬 face with symbols on mouth|swear cursing angry
😈 smiling face with horns|devil evil mischief
💀 skull|dead dying lol
☠️ skull and crossbones|poison danger death
💩 pile of poo|poop
🤡 clown face|clown joke
👻 ghost|boo halloween
👽 alien|ufo space
🤖 robot|bot ai
😺 grinning cat|cat happy
😻 smiling cat with heart-eyes|cat love
🙈 see-no-evil monkey|monkey shy hide
🙉 hear-no-evil monkey|monkey
🙊 speak-no-evil monkey|monkey oops`,
  People: `
👋 waving hand|wave hello hi bye
🤚 raised back of hand|hand
✋ raised hand|high five stop
🖐️ hand with fingers splayed|hand five
👌 ok hand|ok perfect
🤌 pinched fingers|italian chef kiss
🤏 pinching hand|small tiny little
✌️ victory hand|peace two
🤞 crossed fingers|luck hope
🫰 hand with index finger and thumb crossed|money snap
🤟 love-you gesture|love you rock
🤘 sign of the horns|rock metal
🤙 call me hand|call shaka hang loose
👈 backhand index pointing left|left point
👉 backhand index pointing right|right point
👆 backhand index pointing up|up point
👇 backhand index pointing down|down point
☝️ index pointing up|one up
👍 thumbs up|like yes approve good +1
👎 thumbs down|dislike no bad -1
✊ raised fist|fist power
👊 oncoming fist|punch fist bump
👏 clapping hands|clap applause bravo
🙌 raising hands|hooray celebrate praise
🫶 heart hands|love heart
👐 open hands|hug
🤲 palms up together|pray please
🤝 handshake|deal agreement shake
🙏 folded hands|please pray thanks thank you
✍️ writing hand|write
💅 nail polish|nails sassy
💪 flexed biceps|strong muscle gym
🧠 brain|smart think mind
👀 eyes|look see watching
👁️ eye|see
👄 mouth|lips
🫦 biting lip|nervous flirt
👶 baby|child infant
🧒 child|kid
👦 boy|child
👧 girl|child
🧑 person|adult
👨 man|male
👩 woman|female
🧓 older person|old elderly
🧑‍💻 technologist|developer coder programmer laptop
🧑‍🍳 cook|chef
🧑‍🎓 student|graduate
🧑‍🏫 teacher|professor
🧑‍⚕️ health worker|doctor nurse
🧑‍🚀 astronaut|space
🥷 ninja|stealth
🦸 superhero|hero
🧙 mage|wizard magic
🧛 vampire|dracula
🧟 zombie|undead
💃 woman dancing|dance party
🕺 man dancing|dance disco
🏃 person running|run jog
🚶 person walking|walk
🧘 person in lotus position|yoga meditate zen
🛌 person in bed|sleep bed
🤷 person shrugging|shrug dunno whatever
🤦 person facepalming|facepalm ugh
🙋 person raising hand|question hi
🙇 person bowing|bow sorry thanks`,
  Hearts: `
❤️ red heart|love heart
🧡 orange heart|love
💛 yellow heart|love
💚 green heart|love
💙 blue heart|love
💜 purple heart|love
🖤 black heart|love dark
🤍 white heart|love
🤎 brown heart|love
🩷 pink heart|love
💔 broken heart|heartbreak sad
❤️‍🔥 heart on fire|passion love
💕 two hearts|love
💖 sparkling heart|love
💗 growing heart|love
💘 heart with arrow|cupid love
💯 hundred points|100 perfect score
💥 collision|boom explosion
💫 dizzy|star
💦 sweat droplets|water splash
💨 dashing away|fast wind
🔥 fire|lit hot flame
✨ sparkles|magic shine new
⭐ star|favourite favorite
🌟 glowing star|star shine
⚡ high voltage|lightning zap electric fast
💬 speech balloon|chat message comment
💭 thought balloon|think
💤 zzz|sleep`,
  Nature: `
🐶 dog face|dog puppy pet
🐱 cat face|cat kitten pet
🐭 mouse face|mouse
🐹 hamster|pet
🐰 rabbit face|bunny
🦊 fox|fox
🐻 bear|bear
🐼 panda|panda
🐨 koala|koala
🐯 tiger face|tiger
🦁 lion|lion king
🐮 cow face|cow
🐷 pig face|pig
🐸 frog|frog
🐵 monkey face|monkey
🐔 chicken|chicken hen
🐧 penguin|penguin
🐦 bird|bird
🦆 duck|duck
🦅 eagle|eagle
🦉 owl|owl night
🐺 wolf|wolf
🐴 horse face|horse
🦄 unicorn|unicorn magic startup
🐝 honeybee|bee
🦋 butterfly|butterfly
🐌 snail|slow
🐞 lady beetle|ladybug
🐢 turtle|slow tortoise
🐍 snake|snake python
🐙 octopus|octopus
🦈 shark|shark
🐬 dolphin|dolphin
🐳 spouting whale|whale
🦖 t-rex|dinosaur
🌵 cactus|desert plant
🌲 evergreen tree|tree pine
🌳 deciduous tree|tree
🌴 palm tree|beach tropical
🌱 seedling|plant grow sprout
🍀 four leaf clover|luck lucky
🍁 maple leaf|autumn fall canada
🌸 cherry blossom|flower spring
🌹 rose|flower love
🌻 sunflower|flower
🌷 tulip|flower
☀️ sun|sunny weather
🌤️ sun behind small cloud|weather
⛅ sun behind cloud|cloudy weather
🌧️ cloud with rain|rain weather
⛈️ cloud with lightning and rain|storm thunder
❄️ snowflake|snow cold winter
☃️ snowman|snow winter
🌈 rainbow|rainbow pride
🌊 water wave|wave ocean sea
🌙 crescent moon|moon night
🌍 globe europe africa|world earth
🌎 globe americas|world earth
🌏 globe asia australia|world earth`,
  Food: `
🍎 red apple|apple fruit
🍊 tangerine|orange fruit
🍋 lemon|lemon sour
🍌 banana|banana fruit
🍉 watermelon|melon summer
🍇 grapes|grapes wine
🍓 strawberry|strawberry
🍒 cherries|cherry
🍑 peach|peach
🥭 mango|mango
🍍 pineapple|pineapple
🥥 coconut|coconut
🥝 kiwi fruit|kiwi
🍅 tomato|tomato
🥑 avocado|avocado
🥦 broccoli|vegetable
🌶️ hot pepper|spicy chili
🌽 ear of corn|corn
🥕 carrot|carrot vegetable
🥔 potato|potato
🥐 croissant|bread french breakfast
🍞 bread|bread toast
🧀 cheese wedge|cheese
🥚 egg|egg
🍳 cooking|fried egg breakfast
🥓 bacon|bacon breakfast
🍔 hamburger|burger
🍟 french fries|chips fries
🍕 pizza|pizza
🌭 hot dog|hotdog
🌮 taco|taco mexican
🌯 burrito|burrito
🥗 green salad|salad healthy
🍝 spaghetti|pasta
🍜 steaming bowl|ramen noodles
🍣 sushi|sushi japanese
🍱 bento box|bento
🍛 curry rice|curry
🍤 fried shrimp|shrimp tempura
🍩 doughnut|donut
🍪 cookie|cookie biscuit
🎂 birthday cake|birthday cake
🍰 shortcake|cake dessert
🧁 cupcake|cupcake
🍫 chocolate bar|chocolate
🍿 popcorn|popcorn movie
🍦 soft ice cream|ice cream
☕ hot beverage|coffee tea
🍵 teacup without handle|tea matcha
🧋 bubble tea|boba
🥤 cup with straw|soda drink
🍺 beer mug|beer
🍻 clinking beer mugs|cheers beer
🥂 clinking glasses|cheers champagne celebrate
🍷 wine glass|wine
🍸 cocktail glass|cocktail martini
🧊 ice|ice cube cold`,
  Activities: `
⚽ soccer ball|football soccer
🏀 basketball|basketball
🏈 american football|football
⚾ baseball|baseball
🎾 tennis|tennis
🏐 volleyball|volleyball
🏉 rugby football|rugby
🎱 pool 8 ball|billiards
🏓 ping pong|table tennis
🏸 badminton|badminton
⛳ flag in hole|golf
🏆 trophy|win winner champion
🥇 1st place medal|gold first winner
🥈 2nd place medal|silver second
🥉 3rd place medal|bronze third
🏅 sports medal|medal
🎯 bullseye|target goal direct hit
🎮 video game|game controller gaming
🕹️ joystick|game arcade
🎲 game die|dice random
🧩 puzzle piece|puzzle jigsaw
♟️ chess pawn|chess
🎨 artist palette|art paint design
🎬 clapper board|movie film action
🎤 microphone|sing karaoke mic
🎧 headphone|music headphones
🎵 musical note|music note
🎶 musical notes|music song
🎸 guitar|guitar rock
🎹 musical keyboard|piano
🥁 drum|drum
🎉 party popper|party celebrate tada congrats
🎊 confetti ball|party celebrate
🎈 balloon|party birthday
🎁 wrapped gift|present gift birthday
🎄 christmas tree|christmas xmas
🎃 jack-o-lantern|halloween pumpkin
🎆 fireworks|fireworks celebrate new year`,
  Travel: `
🚗 automobile|car drive
🚕 taxi|taxi cab
🚌 bus|bus
🚑 ambulance|ambulance emergency
🚒 fire engine|fire truck
🚓 police car|police
🏎️ racing car|race fast f1
🚲 bicycle|bike cycle
🛴 kick scooter|scooter
🏍️ motorcycle|motorbike
🚂 locomotive|train steam
🚆 train|train rail
🚇 metro|subway underground tube
✈️ airplane|plane flight travel
🛫 airplane departure|takeoff flight
🚀 rocket|launch ship space startup
🛸 flying saucer|ufo
🚁 helicopter|helicopter
⛵ sailboat|boat sail
🚢 ship|ship cruise
⚓ anchor|anchor
🗺️ world map|map travel
🧭 compass|compass direction
🏔️ snow-capped mountain|mountain
🏖️ beach with umbrella|beach holiday vacation
🏝️ desert island|island holiday
🏠 house|home
🏢 office building|office work
🏥 hospital|hospital
🏫 school|school
🏰 castle|castle
🗽 statue of liberty|new york usa
🗼 tokyo tower|tokyo japan
🌃 night with stars|city night
🎡 ferris wheel|fair`,
  Objects: `
⌚ watch|time watch
📱 mobile phone|phone iphone android
💻 laptop|computer laptop
⌨️ keyboard|keyboard type
🖥️ desktop computer|computer pc monitor
🖨️ printer|print
🖱️ computer mouse|mouse click
💾 floppy disk|save disk
💿 optical disk|cd
📷 camera|photo camera
🎥 movie camera|film video
📺 television|tv
📞 telephone receiver|phone call
🔋 battery|battery power
🔌 electric plug|plug power
💡 light bulb|idea light
🔦 flashlight|torch light
🕯️ candle|candle
💸 money with wings|money spend expensive
💵 dollar banknote|money cash dollar
💰 money bag|money rich
💳 credit card|card payment
💎 gem stone|diamond gem jewel
⚖️ balance scale|law justice
🔧 wrench|tool fix spanner
🔨 hammer|tool build
🛠️ hammer and wrench|tools build fix
⚙️ gear|settings cog
🔗 link|link chain url
🧲 magnet|magnet attract
🧪 test tube|science test experiment
🔬 microscope|science research
🔭 telescope|space astronomy
💊 pill|medicine drug
💉 syringe|vaccine injection
🧬 dna|dna genetics
🦠 microbe|germ virus bacteria
🧹 broom|clean sweep
🧻 roll of paper|toilet paper
🛒 shopping cart|shop cart buy
🔑 key|key password lock
🗝️ old key|key
🔒 locked|lock secure private
🔓 unlocked|unlock open
🚪 door|door exit
🪑 chair|chair seat
🛏️ bed|bed sleep
📦 package|box package parcel shipping
✉️ envelope|email mail letter
📧 e-mail|email mail
📨 incoming envelope|email inbox
📮 postbox|mail post
📝 memo|note write todo
✏️ pencil|pencil write edit
🖊️ pen|pen write
📌 pushpin|pin
📎 paperclip|clip attach attachment
✂️ scissors|cut
📁 file folder|folder directory
📂 open file folder|folder open
📅 calendar|date calendar schedule
📆 tear-off calendar|date calendar
🗓️ spiral calendar|calendar schedule
📊 bar chart|chart graph stats
📈 chart increasing|chart growth up stonks
📉 chart decreasing|chart down loss
📋 clipboard|clipboard list
📚 books|books study read library
📖 open book|book read
🔖 bookmark|bookmark
🏷️ label|tag label price
📣 megaphone|announce
📢 loudspeaker|announcement
🔔 bell|notification bell alert
🔕 bell with slash|mute silent
⏰ alarm clock|alarm time wake
⏳ hourglass not done|time waiting
⌛ hourglass done|time
⏱️ stopwatch|timer stopwatch
🧯 fire extinguisher|fire
🗑️ wastebasket|trash bin delete`,
  Symbols: `
✅ check mark button|done yes complete tick
☑️ check box with check|done
✔️ check mark|done yes tick
❌ cross mark|no wrong delete x
❎ cross mark button|no
➕ plus|add plus
➖ minus|subtract minus
➗ divide|division
✖️ multiply|times
❓ red question mark|question
❗ red exclamation mark|exclamation important
‼️ double exclamation mark|important
⚠️ warning|warning caution alert
🚫 prohibited|no forbidden
⛔ no entry|stop forbidden
🔴 red circle|red dot
🟠 orange circle|orange dot
🟡 yellow circle|yellow dot
🟢 green circle|green dot online
🔵 blue circle|blue dot
🟣 purple circle|purple dot
⚫ black circle|black dot
⚪ white circle|white dot
🟥 red square|red
🟩 green square|green
🟦 blue square|blue
⬆️ up arrow|up arrow
⬇️ down arrow|down arrow
⬅️ left arrow|left arrow back
➡️ right arrow|right arrow next
↩️ right arrow curving left|return back undo
🔄 counterclockwise arrows|refresh sync reload
🔁 repeat button|repeat loop
▶️ play button|play start
⏸️ pause button|pause
⏹️ stop button|stop
⏭️ next track|next skip
🔀 shuffle|shuffle random
🔊 speaker high volume|sound loud
🔇 muted speaker|mute silent
♻️ recycling symbol|recycle
✳️ eight-spoked asterisk|asterisk
©️ copyright|copyright
®️ registered|registered trademark
™️ trade mark|trademark tm
🆗 ok button|ok
🆕 new button|new
🆓 free button|free
🔝 top arrow|top
💲 heavy dollar sign|dollar money
💱 currency exchange|currency
🏁 chequered flag|finish race
🚩 triangular flag|flag red flag
🏳️‍🌈 rainbow flag|pride lgbt
🇬🇧 flag united kingdom|uk britain england
🇺🇸 flag united states|usa america
🇪🇺 flag european union|eu europe
🇫🇷 flag france|france
🇩🇪 flag germany|germany
🇮🇹 flag italy|italy
🇪🇸 flag spain|spain
🇯🇵 flag japan|japan
🇮🇳 flag india|india
🇨🇦 flag canada|canada
🇦🇺 flag australia|australia`
}

const seen = new Set<string>()
export const EMOJI: Emoji[] = Object.entries(DATA).flatMap(([group, block]) =>
  block
    .trim()
    .split('\n')
    .flatMap((line) => {
      const space = line.indexOf(' ')
      const char = line.slice(0, space)
      if (seen.has(char)) return []
      seen.add(char)
      const [name, keywords = ''] = line.slice(space + 1).split('|')
      return [{ char, name, keywords, group }]
    })
)

export const EMOJI_GROUPS = Object.keys(DATA)
