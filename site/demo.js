(()=>{var he=Object.defineProperty;var pe=(r,e,t)=>e in r?he(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var G=(r,e,t)=>pe(r,typeof e!="symbol"?e+"":e,t);var ge={sqrt:Math.sqrt,cbrt:Math.cbrt,abs:Math.abs,round:Math.round,floor:Math.floor,ceil:Math.ceil,sin:Math.sin,cos:Math.cos,tan:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,ln:Math.log,log:Math.log10,log2:Math.log2,exp:Math.exp,min:Math.min,max:Math.max},V={pi:Math.PI,\u03C0:Math.PI,e:Math.E,tau:Math.PI*2};function fe(r){let e=[],t=0;for(;t<r.length;){let n=r[t];if(/\s/.test(n)){t++;continue}let o=/^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(r.slice(t));if(o){e.push({t:"num",v:parseFloat(o[0])}),t+=o[0].length;continue}if(/^x(?=[\s\d(.])/i.test(r.slice(t))&&e.length){e.push({t:"op",v:"*"}),t++;continue}let i=/^[a-zπ][a-z0-9]*/i.exec(r.slice(t));if(i){let c=i[0].toLowerCase();c==="mod"?e.push({t:"op",v:"mod"}):c==="of"?e.push({t:"op",v:"*"}):e.push({t:"id",v:c}),t+=i[0].length;continue}if(n==="("||n===")"||n===","){e.push({t:n,v:n}),t++;continue}if(n==="*"&&r[t+1]==="*"){e.push({t:"op",v:"^"}),t+=2;continue}let a={"+":"+","-":"-","\u2212":"-","*":"*","\xD7":"*","\xB7":"*","/":"/","\xF7":"/","^":"^","%":"%","!":"!"}[n];if(!a)throw new Error(`Unexpected "${n}"`);e.push({t:"op",v:a}),t++}return e}var U=class{constructor(e){this.tokens=e;G(this,"pos",0)}parse(){let e=this.expr();if(this.pos<this.tokens.length)throw new Error("Unexpected input");return e}peek(){return this.tokens[this.pos]}isOp(e){let t=this.peek();return t?.t==="op"&&t.v===e}expr(){let e=this.term();for(;this.isOp("+")||this.isOp("-");){let t=this.tokens[this.pos++].v,n=this.term();e=t==="+"?e+n:e-n}return e}term(){let e=this.unary();for(;;){let t=this.peek();if(t?.t==="op"&&(t.v==="*"||t.v==="/"||t.v==="mod"||t.v==="%"&&this.startsOperand(1))){this.pos++;let n=this.unary();t.v==="*"?e*=n:t.v==="/"?e/=n:e=(e%n+n)%n}else if(t&&(t.t==="num"||t.t==="id"||t.t==="("))e*=this.unary();else return e}}startsOperand(e){let t=this.tokens[this.pos+e];return!!t&&(t.t==="num"||t.t==="id"||t.t==="(")}unary(){return this.isOp("-")?(this.pos++,-this.unary()):this.isOp("+")?(this.pos++,this.unary()):this.power()}power(){let e=this.postfix();return this.isOp("^")?(this.pos++,Math.pow(e,this.unary())):e}postfix(){let e=this.primary();for(;;)if(this.isOp("!"))this.pos++,e=be(e);else if(this.isOp("%")&&!this.startsOperand(1))this.pos++,e/=100;else return e}primary(){let e=this.tokens[this.pos++];if(!e)throw new Error("Unexpected end");if(e.t==="num")return e.v;if(e.t==="("){let t=this.expr();if(this.peek()?.t!==")")throw new Error("Missing )");return this.pos++,t}if(e.t==="id"){if(e.v in V)return V[e.v];let t=ge[e.v];if(!t)throw new Error(`Unknown "${e.v}"`);if(this.peek()?.t!=="(")return t(this.power());this.pos++;let n=[this.expr()];for(;this.peek()?.t===",";)this.pos++,n.push(this.expr());if(this.peek()?.t!==")")throw new Error("Missing )");return this.pos++,t(...n)}throw new Error("Unexpected token")}};function be(r){if(r<0||!Number.isInteger(r)||r>170)return NaN;let e=1;for(let t=2;t<=r;t++)e*=t;return e}var ye=/[+\-−*/^%×÷!()]|\b(sqrt|cbrt|abs|round|floor|ceil|sin|cos|tan|asin|acos|atan|ln|log|log2|exp|min|max|mod|of)\b|\d\s*x\s*\d|\d\s*(pi|π|tau)\b/i;function J(r){let e=r.trim().replace(/(\d),(?=\d{3}(?!\d))/g,"$1").replace(/=\s*$/,"");if(!e||!ye.test(e)||!/[\dπ]|pi|tau/i.test(e))return null;let t;try{t=new U(fe(e)).parse()}catch{return null}return Number.isFinite(t)?{value:t,text:z(t)}:null}function z(r){if(r===0)return"0";let e=Math.abs(r);if(e>=1e15||e<1e-9)return r.toExponential(6).replace(/\.?0+e/,"e");let t=Number(r.toPrecision(12));return new Intl.NumberFormat("en-US",{maximumFractionDigits:10}).format(t)}function X(r){return String(Number(r.toPrecision(12)))}function E(r,e,t){return Math.min(t,Math.max(e,r))}function q(r){return Math.round(r).toString(16).padStart(2,"0")}function ke(r,e,t){r/=255,e/=255,t/=255;let n=Math.max(r,e,t),o=Math.min(r,e,t),i=(n+o)/2;if(n===o)return[0,0,Math.round(i*100)];let a=n-o,c=i>.5?a/(2-n-o):a/(n+o),u=n===r?(e-t)/a+(e<t?6:0):n===e?(t-r)/a+2:(r-e)/a+4;return u*=60,[Math.round(u),Math.round(c*100),Math.round(i*100)]}function we(r,e,t){e/=100,t/=100;let n=a=>(a+r/30)%12,o=e*Math.min(t,1-t),i=a=>t-o*Math.max(-1,Math.min(n(a)-3,Math.min(9-n(a),1)));return[i(0)*255,i(8)*255,i(4)*255]}function H(r,e,t,n=1){r=E(Math.round(r),0,255),e=E(Math.round(e),0,255),t=E(Math.round(t),0,255),n=E(n,0,1);let[o,i,a]=ke(r,e,t),c=n<1?q(n*255):"";return{r,g:e,b:t,a:n,hex:`#${q(r)}${q(e)}${q(t)}${c}`.toUpperCase(),rgb:n<1?`rgba(${r}, ${e}, ${t}, ${+n.toFixed(2)})`:`rgb(${r}, ${e}, ${t})`,hsl:n<1?`hsla(${o}, ${i}%, ${a}%, ${+n.toFixed(2)})`:`hsl(${o}, ${i}%, ${a}%)`}}function Z(r){let e=r.trim().toLowerCase(),t=/^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(e);if(t&&(e.startsWith("#")||t[1].length===6&&/[a-f]/.test(t[1]))){let i=t[1];i.length<=4&&(i=[...i].map(c=>c+c).join(""));let a=c=>parseInt(i.slice(c,c+2),16);return H(a(0),a(2),a(4),i.length===8?a(6)/255:1)}let n=/^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})(?:[\s,/]+([\d.]+%?))?\s*\)?$/.exec(e);if(n){let i=n[4]?n[4].endsWith("%")?parseFloat(n[4])/100:parseFloat(n[4]):1;return H(+n[1],+n[2],+n[3],i)}let o=/^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%?[\s,]+([\d.]+)%?(?:[\s,/]+([\d.]+%?))?\s*\)?$/.exec(e);if(o){let[i,a,c]=we(+o[1]%360,E(+o[2],0,100),E(+o[3],0,100)),u=o[4]?o[4].endsWith("%")?parseFloat(o[4])/100:parseFloat(o[4]):1;return H(i,a,c,u)}return null}var ve={s:1e3,sec:1e3,secs:1e3,second:1e3,seconds:1e3,m:6e4,min:6e4,mins:6e4,minute:6e4,minutes:6e4,h:36e5,hr:36e5,hrs:36e5,hour:36e5,hours:36e5},xe=/^\s*(\d+(?:\.\d+)?)\s*(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h)?(?![a-z])\s*(?:and\s+)?/i,Me=/^(?:timer|countdown|remind(?:\s+me)?(?:\s+in)?|alarm\s+in|in)\s+/i;function Y(r){let e=Me.exec(r.trim());if(!e)return null;let t=r.trim().slice(e[0].length),n=0,o=0;for(;;){let a=xe.exec(t);if(!a||(n+=parseFloat(a[1])*ve[(a[2]??"min").toLowerCase()],t=t.slice(a[0].length),o++,!a[2]))break}if(!o||n<1e3||n>7*864e5)return null;let i=t.replace(/^(?:to|for|-|:)\s+/i,"").trim();return{ms:Math.round(n),label:i}}function O(r){let e=Math.round(r/1e3),t=Math.floor(e/3600),n=Math.floor(e%3600/60),o=e%60,i=[];return t&&i.push(`${t} h`),n&&i.push(`${n} min`),o&&!t&&i.push(`${o} s`),i.join(" ")||"0 s"}var ee={Smileys:`
\u{1F600} grinning face|smile happy
\u{1F603} grinning face with big eyes|smile happy joy
\u{1F604} grinning face with smiling eyes|smile happy laugh
\u{1F601} beaming face|grin teeth happy
\u{1F606} grinning squinting face|laugh lol
\u{1F605} grinning face with sweat|relief nervous phew
\u{1F923} rolling on the floor laughing|rofl lol lmao
\u{1F602} face with tears of joy|lol laugh crying funny
\u{1F642} slightly smiling face|smile ok
\u{1F643} upside-down face|silly sarcasm
\u{1F609} winking face|wink flirt
\u{1F60A} smiling face with smiling eyes|blush happy
\u{1F607} smiling face with halo|angel innocent
\u{1F970} smiling face with hearts|love adore crush
\u{1F60D} heart eyes|love crush
\u{1F929} star-struck|wow amazing excited
\u{1F618} face blowing a kiss|kiss love
\u{1F60B} face savoring food|yum delicious tongue
\u{1F61B} face with tongue|tongue playful
\u{1F61C} winking face with tongue|crazy silly
\u{1F92A} zany face|crazy wild goofy
\u{1F911} money-mouth face|rich money dollar
\u{1F917} hugging face|hug thanks
\u{1F92D} face with hand over mouth|oops giggle
\u{1FAE2} face with open eyes and hand over mouth|shock gasp
\u{1F92B} shushing face|quiet secret shh
\u{1F914} thinking face|hmm think wonder
\u{1FAE1} saluting face|salute respect yes sir
\u{1F910} zipper-mouth face|secret quiet
\u{1F928} face with raised eyebrow|suspicious skeptical
\u{1F610} neutral face|meh blank
\u{1F611} expressionless face|meh annoyed
\u{1F636} face without mouth|speechless silent
\u{1FAE0} melting face|melt hot embarrassed
\u{1F60F} smirking face|smirk smug
\u{1F612} unamused face|meh unimpressed
\u{1F644} face with rolling eyes|eyeroll whatever
\u{1F62C} grimacing face|awkward yikes
\u{1F62E}\u200D\u{1F4A8} face exhaling|sigh relief phew
\u{1F925} lying face|liar pinocchio
\u{1F60C} relieved face|calm content
\u{1F614} pensive face|sad thoughtful
\u{1F62A} sleepy face|tired
\u{1F924} drooling face|drool want
\u{1F634} sleeping face|sleep zzz tired
\u{1F637} face with medical mask|sick mask ill
\u{1F912} face with thermometer|sick fever ill
\u{1F922} nauseated face|sick gross
\u{1F92E} face vomiting|sick gross puke
\u{1F975} hot face|hot heat sweating
\u{1F976} cold face|cold freezing
\u{1F974} woozy face|drunk dizzy
\u{1F635} face with crossed-out eyes|dizzy dead
\u{1F92F} exploding head|mind blown shocked
\u{1F920} cowboy hat face|cowboy yeehaw
\u{1F973} partying face|party celebrate birthday
\u{1F978} disguised face|disguise incognito
\u{1F60E} smiling face with sunglasses|cool sunglasses
\u{1F913} nerd face|nerd geek glasses
\u{1F9D0} face with monocle|inspect fancy
\u{1F615} confused face|confused unsure
\u{1F61F} worried face|worried concerned
\u{1F641} slightly frowning face|sad frown
\u{1F62E} face with open mouth|wow surprised
\u{1F62F} hushed face|surprised
\u{1F632} astonished face|shocked amazed
\u{1F633} flushed face|embarrassed blush
\u{1F97A} pleading face|please puppy eyes
\u{1F979} face holding back tears|touched grateful emotional
\u{1F626} frowning face with open mouth|shock
\u{1F628} fearful face|scared fear
\u{1F630} anxious face with sweat|nervous anxious
\u{1F622} crying face|sad tear
\u{1F62D} loudly crying face|sob cry sad
\u{1F631} face screaming in fear|scream horror omg
\u{1F616} confounded face|frustrated
\u{1F623} persevering face|struggle
\u{1F61E} disappointed face|sad disappointed
\u{1F613} downcast face with sweat|stress
\u{1F629} weary face|tired exhausted
\u{1F62B} tired face|exhausted
\u{1F971} yawning face|yawn bored tired
\u{1F624} face with steam from nose|triumph angry huff
\u{1F621} enraged face|angry mad rage
\u{1F620} angry face|angry mad
\u{1F92C} face with symbols on mouth|swear cursing angry
\u{1F608} smiling face with horns|devil evil mischief
\u{1F480} skull|dead dying lol
\u2620\uFE0F skull and crossbones|poison danger death
\u{1F4A9} pile of poo|poop
\u{1F921} clown face|clown joke
\u{1F47B} ghost|boo halloween
\u{1F47D} alien|ufo space
\u{1F916} robot|bot ai
\u{1F63A} grinning cat|cat happy
\u{1F63B} smiling cat with heart-eyes|cat love
\u{1F648} see-no-evil monkey|monkey shy hide
\u{1F649} hear-no-evil monkey|monkey
\u{1F64A} speak-no-evil monkey|monkey oops`,People:`
\u{1F44B} waving hand|wave hello hi bye
\u{1F91A} raised back of hand|hand
\u270B raised hand|high five stop
\u{1F590}\uFE0F hand with fingers splayed|hand five
\u{1F44C} ok hand|ok perfect
\u{1F90C} pinched fingers|italian chef kiss
\u{1F90F} pinching hand|small tiny little
\u270C\uFE0F victory hand|peace two
\u{1F91E} crossed fingers|luck hope
\u{1FAF0} hand with index finger and thumb crossed|money snap
\u{1F91F} love-you gesture|love you rock
\u{1F918} sign of the horns|rock metal
\u{1F919} call me hand|call shaka hang loose
\u{1F448} backhand index pointing left|left point
\u{1F449} backhand index pointing right|right point
\u{1F446} backhand index pointing up|up point
\u{1F447} backhand index pointing down|down point
\u261D\uFE0F index pointing up|one up
\u{1F44D} thumbs up|like yes approve good +1
\u{1F44E} thumbs down|dislike no bad -1
\u270A raised fist|fist power
\u{1F44A} oncoming fist|punch fist bump
\u{1F44F} clapping hands|clap applause bravo
\u{1F64C} raising hands|hooray celebrate praise
\u{1FAF6} heart hands|love heart
\u{1F450} open hands|hug
\u{1F932} palms up together|pray please
\u{1F91D} handshake|deal agreement shake
\u{1F64F} folded hands|please pray thanks thank you
\u270D\uFE0F writing hand|write
\u{1F485} nail polish|nails sassy
\u{1F4AA} flexed biceps|strong muscle gym
\u{1F9E0} brain|smart think mind
\u{1F440} eyes|look see watching
\u{1F441}\uFE0F eye|see
\u{1F444} mouth|lips
\u{1FAE6} biting lip|nervous flirt
\u{1F476} baby|child infant
\u{1F9D2} child|kid
\u{1F466} boy|child
\u{1F467} girl|child
\u{1F9D1} person|adult
\u{1F468} man|male
\u{1F469} woman|female
\u{1F9D3} older person|old elderly
\u{1F9D1}\u200D\u{1F4BB} technologist|developer coder programmer laptop
\u{1F9D1}\u200D\u{1F373} cook|chef
\u{1F9D1}\u200D\u{1F393} student|graduate
\u{1F9D1}\u200D\u{1F3EB} teacher|professor
\u{1F9D1}\u200D\u2695\uFE0F health worker|doctor nurse
\u{1F9D1}\u200D\u{1F680} astronaut|space
\u{1F977} ninja|stealth
\u{1F9B8} superhero|hero
\u{1F9D9} mage|wizard magic
\u{1F9DB} vampire|dracula
\u{1F9DF} zombie|undead
\u{1F483} woman dancing|dance party
\u{1F57A} man dancing|dance disco
\u{1F3C3} person running|run jog
\u{1F6B6} person walking|walk
\u{1F9D8} person in lotus position|yoga meditate zen
\u{1F6CC} person in bed|sleep bed
\u{1F937} person shrugging|shrug dunno whatever
\u{1F926} person facepalming|facepalm ugh
\u{1F64B} person raising hand|question hi
\u{1F647} person bowing|bow sorry thanks`,Hearts:`
\u2764\uFE0F red heart|love heart
\u{1F9E1} orange heart|love
\u{1F49B} yellow heart|love
\u{1F49A} green heart|love
\u{1F499} blue heart|love
\u{1F49C} purple heart|love
\u{1F5A4} black heart|love dark
\u{1F90D} white heart|love
\u{1F90E} brown heart|love
\u{1FA77} pink heart|love
\u{1F494} broken heart|heartbreak sad
\u2764\uFE0F\u200D\u{1F525} heart on fire|passion love
\u{1F495} two hearts|love
\u{1F496} sparkling heart|love
\u{1F497} growing heart|love
\u{1F498} heart with arrow|cupid love
\u{1F4AF} hundred points|100 perfect score
\u{1F4A5} collision|boom explosion
\u{1F4AB} dizzy|star
\u{1F4A6} sweat droplets|water splash
\u{1F4A8} dashing away|fast wind
\u{1F525} fire|lit hot flame
\u2728 sparkles|magic shine new
\u2B50 star|favourite favorite
\u{1F31F} glowing star|star shine
\u26A1 high voltage|lightning zap electric fast
\u{1F4AC} speech balloon|chat message comment
\u{1F4AD} thought balloon|think
\u{1F4A4} zzz|sleep`,Nature:`
\u{1F436} dog face|dog puppy pet
\u{1F431} cat face|cat kitten pet
\u{1F42D} mouse face|mouse
\u{1F439} hamster|pet
\u{1F430} rabbit face|bunny
\u{1F98A} fox|fox
\u{1F43B} bear|bear
\u{1F43C} panda|panda
\u{1F428} koala|koala
\u{1F42F} tiger face|tiger
\u{1F981} lion|lion king
\u{1F42E} cow face|cow
\u{1F437} pig face|pig
\u{1F438} frog|frog
\u{1F435} monkey face|monkey
\u{1F414} chicken|chicken hen
\u{1F427} penguin|penguin
\u{1F426} bird|bird
\u{1F986} duck|duck
\u{1F985} eagle|eagle
\u{1F989} owl|owl night
\u{1F43A} wolf|wolf
\u{1F434} horse face|horse
\u{1F984} unicorn|unicorn magic startup
\u{1F41D} honeybee|bee
\u{1F98B} butterfly|butterfly
\u{1F40C} snail|slow
\u{1F41E} lady beetle|ladybug
\u{1F422} turtle|slow tortoise
\u{1F40D} snake|snake python
\u{1F419} octopus|octopus
\u{1F988} shark|shark
\u{1F42C} dolphin|dolphin
\u{1F433} spouting whale|whale
\u{1F996} t-rex|dinosaur
\u{1F335} cactus|desert plant
\u{1F332} evergreen tree|tree pine
\u{1F333} deciduous tree|tree
\u{1F334} palm tree|beach tropical
\u{1F331} seedling|plant grow sprout
\u{1F340} four leaf clover|luck lucky
\u{1F341} maple leaf|autumn fall canada
\u{1F338} cherry blossom|flower spring
\u{1F339} rose|flower love
\u{1F33B} sunflower|flower
\u{1F337} tulip|flower
\u2600\uFE0F sun|sunny weather
\u{1F324}\uFE0F sun behind small cloud|weather
\u26C5 sun behind cloud|cloudy weather
\u{1F327}\uFE0F cloud with rain|rain weather
\u26C8\uFE0F cloud with lightning and rain|storm thunder
\u2744\uFE0F snowflake|snow cold winter
\u2603\uFE0F snowman|snow winter
\u{1F308} rainbow|rainbow pride
\u{1F30A} water wave|wave ocean sea
\u{1F319} crescent moon|moon night
\u{1F30D} globe europe africa|world earth
\u{1F30E} globe americas|world earth
\u{1F30F} globe asia australia|world earth`,Food:`
\u{1F34E} red apple|apple fruit
\u{1F34A} tangerine|orange fruit
\u{1F34B} lemon|lemon sour
\u{1F34C} banana|banana fruit
\u{1F349} watermelon|melon summer
\u{1F347} grapes|grapes wine
\u{1F353} strawberry|strawberry
\u{1F352} cherries|cherry
\u{1F351} peach|peach
\u{1F96D} mango|mango
\u{1F34D} pineapple|pineapple
\u{1F965} coconut|coconut
\u{1F95D} kiwi fruit|kiwi
\u{1F345} tomato|tomato
\u{1F951} avocado|avocado
\u{1F966} broccoli|vegetable
\u{1F336}\uFE0F hot pepper|spicy chili
\u{1F33D} ear of corn|corn
\u{1F955} carrot|carrot vegetable
\u{1F954} potato|potato
\u{1F950} croissant|bread french breakfast
\u{1F35E} bread|bread toast
\u{1F9C0} cheese wedge|cheese
\u{1F95A} egg|egg
\u{1F373} cooking|fried egg breakfast
\u{1F953} bacon|bacon breakfast
\u{1F354} hamburger|burger
\u{1F35F} french fries|chips fries
\u{1F355} pizza|pizza
\u{1F32D} hot dog|hotdog
\u{1F32E} taco|taco mexican
\u{1F32F} burrito|burrito
\u{1F957} green salad|salad healthy
\u{1F35D} spaghetti|pasta
\u{1F35C} steaming bowl|ramen noodles
\u{1F363} sushi|sushi japanese
\u{1F371} bento box|bento
\u{1F35B} curry rice|curry
\u{1F364} fried shrimp|shrimp tempura
\u{1F369} doughnut|donut
\u{1F36A} cookie|cookie biscuit
\u{1F382} birthday cake|birthday cake
\u{1F370} shortcake|cake dessert
\u{1F9C1} cupcake|cupcake
\u{1F36B} chocolate bar|chocolate
\u{1F37F} popcorn|popcorn movie
\u{1F366} soft ice cream|ice cream
\u2615 hot beverage|coffee tea
\u{1F375} teacup without handle|tea matcha
\u{1F9CB} bubble tea|boba
\u{1F964} cup with straw|soda drink
\u{1F37A} beer mug|beer
\u{1F37B} clinking beer mugs|cheers beer
\u{1F942} clinking glasses|cheers champagne celebrate
\u{1F377} wine glass|wine
\u{1F378} cocktail glass|cocktail martini
\u{1F9CA} ice|ice cube cold`,Activities:`
\u26BD soccer ball|football soccer
\u{1F3C0} basketball|basketball
\u{1F3C8} american football|football
\u26BE baseball|baseball
\u{1F3BE} tennis|tennis
\u{1F3D0} volleyball|volleyball
\u{1F3C9} rugby football|rugby
\u{1F3B1} pool 8 ball|billiards
\u{1F3D3} ping pong|table tennis
\u{1F3F8} badminton|badminton
\u26F3 flag in hole|golf
\u{1F3C6} trophy|win winner champion
\u{1F947} 1st place medal|gold first winner
\u{1F948} 2nd place medal|silver second
\u{1F949} 3rd place medal|bronze third
\u{1F3C5} sports medal|medal
\u{1F3AF} bullseye|target goal direct hit
\u{1F3AE} video game|game controller gaming
\u{1F579}\uFE0F joystick|game arcade
\u{1F3B2} game die|dice random
\u{1F9E9} puzzle piece|puzzle jigsaw
\u265F\uFE0F chess pawn|chess
\u{1F3A8} artist palette|art paint design
\u{1F3AC} clapper board|movie film action
\u{1F3A4} microphone|sing karaoke mic
\u{1F3A7} headphone|music headphones
\u{1F3B5} musical note|music note
\u{1F3B6} musical notes|music song
\u{1F3B8} guitar|guitar rock
\u{1F3B9} musical keyboard|piano
\u{1F941} drum|drum
\u{1F389} party popper|party celebrate tada congrats
\u{1F38A} confetti ball|party celebrate
\u{1F388} balloon|party birthday
\u{1F381} wrapped gift|present gift birthday
\u{1F384} christmas tree|christmas xmas
\u{1F383} jack-o-lantern|halloween pumpkin
\u{1F386} fireworks|fireworks celebrate new year`,Travel:`
\u{1F697} automobile|car drive
\u{1F695} taxi|taxi cab
\u{1F68C} bus|bus
\u{1F691} ambulance|ambulance emergency
\u{1F692} fire engine|fire truck
\u{1F693} police car|police
\u{1F3CE}\uFE0F racing car|race fast f1
\u{1F6B2} bicycle|bike cycle
\u{1F6F4} kick scooter|scooter
\u{1F3CD}\uFE0F motorcycle|motorbike
\u{1F682} locomotive|train steam
\u{1F686} train|train rail
\u{1F687} metro|subway underground tube
\u2708\uFE0F airplane|plane flight travel
\u{1F6EB} airplane departure|takeoff flight
\u{1F680} rocket|launch ship space startup
\u{1F6F8} flying saucer|ufo
\u{1F681} helicopter|helicopter
\u26F5 sailboat|boat sail
\u{1F6A2} ship|ship cruise
\u2693 anchor|anchor
\u{1F5FA}\uFE0F world map|map travel
\u{1F9ED} compass|compass direction
\u{1F3D4}\uFE0F snow-capped mountain|mountain
\u{1F3D6}\uFE0F beach with umbrella|beach holiday vacation
\u{1F3DD}\uFE0F desert island|island holiday
\u{1F3E0} house|home
\u{1F3E2} office building|office work
\u{1F3E5} hospital|hospital
\u{1F3EB} school|school
\u{1F3F0} castle|castle
\u{1F5FD} statue of liberty|new york usa
\u{1F5FC} tokyo tower|tokyo japan
\u{1F303} night with stars|city night
\u{1F3A1} ferris wheel|fair`,Objects:`
\u231A watch|time watch
\u{1F4F1} mobile phone|phone iphone android
\u{1F4BB} laptop|computer laptop
\u2328\uFE0F keyboard|keyboard type
\u{1F5A5}\uFE0F desktop computer|computer pc monitor
\u{1F5A8}\uFE0F printer|print
\u{1F5B1}\uFE0F computer mouse|mouse click
\u{1F4BE} floppy disk|save disk
\u{1F4BF} optical disk|cd
\u{1F4F7} camera|photo camera
\u{1F3A5} movie camera|film video
\u{1F4FA} television|tv
\u{1F4DE} telephone receiver|phone call
\u{1F50B} battery|battery power
\u{1F50C} electric plug|plug power
\u{1F4A1} light bulb|idea light
\u{1F526} flashlight|torch light
\u{1F56F}\uFE0F candle|candle
\u{1F4B8} money with wings|money spend expensive
\u{1F4B5} dollar banknote|money cash dollar
\u{1F4B0} money bag|money rich
\u{1F4B3} credit card|card payment
\u{1F48E} gem stone|diamond gem jewel
\u2696\uFE0F balance scale|law justice
\u{1F527} wrench|tool fix spanner
\u{1F528} hammer|tool build
\u{1F6E0}\uFE0F hammer and wrench|tools build fix
\u2699\uFE0F gear|settings cog
\u{1F517} link|link chain url
\u{1F9F2} magnet|magnet attract
\u{1F9EA} test tube|science test experiment
\u{1F52C} microscope|science research
\u{1F52D} telescope|space astronomy
\u{1F48A} pill|medicine drug
\u{1F489} syringe|vaccine injection
\u{1F9EC} dna|dna genetics
\u{1F9A0} microbe|germ virus bacteria
\u{1F9F9} broom|clean sweep
\u{1F9FB} roll of paper|toilet paper
\u{1F6D2} shopping cart|shop cart buy
\u{1F511} key|key password lock
\u{1F5DD}\uFE0F old key|key
\u{1F512} locked|lock secure private
\u{1F513} unlocked|unlock open
\u{1F6AA} door|door exit
\u{1FA91} chair|chair seat
\u{1F6CF}\uFE0F bed|bed sleep
\u{1F4E6} package|box package parcel shipping
\u2709\uFE0F envelope|email mail letter
\u{1F4E7} e-mail|email mail
\u{1F4E8} incoming envelope|email inbox
\u{1F4EE} postbox|mail post
\u{1F4DD} memo|note write todo
\u270F\uFE0F pencil|pencil write edit
\u{1F58A}\uFE0F pen|pen write
\u{1F4CC} pushpin|pin
\u{1F4CE} paperclip|clip attach attachment
\u2702\uFE0F scissors|cut
\u{1F4C1} file folder|folder directory
\u{1F4C2} open file folder|folder open
\u{1F4C5} calendar|date calendar schedule
\u{1F4C6} tear-off calendar|date calendar
\u{1F5D3}\uFE0F spiral calendar|calendar schedule
\u{1F4CA} bar chart|chart graph stats
\u{1F4C8} chart increasing|chart growth up stonks
\u{1F4C9} chart decreasing|chart down loss
\u{1F4CB} clipboard|clipboard list
\u{1F4DA} books|books study read library
\u{1F4D6} open book|book read
\u{1F516} bookmark|bookmark
\u{1F3F7}\uFE0F label|tag label price
\u{1F4E3} megaphone|announce
\u{1F4E2} loudspeaker|announcement
\u{1F514} bell|notification bell alert
\u{1F515} bell with slash|mute silent
\u23F0 alarm clock|alarm time wake
\u23F3 hourglass not done|time waiting
\u231B hourglass done|time
\u23F1\uFE0F stopwatch|timer stopwatch
\u{1F9EF} fire extinguisher|fire
\u{1F5D1}\uFE0F wastebasket|trash bin delete`,Symbols:`
\u2705 check mark button|done yes complete tick
\u2611\uFE0F check box with check|done
\u2714\uFE0F check mark|done yes tick
\u274C cross mark|no wrong delete x
\u274E cross mark button|no
\u2795 plus|add plus
\u2796 minus|subtract minus
\u2797 divide|division
\u2716\uFE0F multiply|times
\u2753 red question mark|question
\u2757 red exclamation mark|exclamation important
\u203C\uFE0F double exclamation mark|important
\u26A0\uFE0F warning|warning caution alert
\u{1F6AB} prohibited|no forbidden
\u26D4 no entry|stop forbidden
\u{1F534} red circle|red dot
\u{1F7E0} orange circle|orange dot
\u{1F7E1} yellow circle|yellow dot
\u{1F7E2} green circle|green dot online
\u{1F535} blue circle|blue dot
\u{1F7E3} purple circle|purple dot
\u26AB black circle|black dot
\u26AA white circle|white dot
\u{1F7E5} red square|red
\u{1F7E9} green square|green
\u{1F7E6} blue square|blue
\u2B06\uFE0F up arrow|up arrow
\u2B07\uFE0F down arrow|down arrow
\u2B05\uFE0F left arrow|left arrow back
\u27A1\uFE0F right arrow|right arrow next
\u21A9\uFE0F right arrow curving left|return back undo
\u{1F504} counterclockwise arrows|refresh sync reload
\u{1F501} repeat button|repeat loop
\u25B6\uFE0F play button|play start
\u23F8\uFE0F pause button|pause
\u23F9\uFE0F stop button|stop
\u23ED\uFE0F next track|next skip
\u{1F500} shuffle|shuffle random
\u{1F50A} speaker high volume|sound loud
\u{1F507} muted speaker|mute silent
\u267B\uFE0F recycling symbol|recycle
\u2733\uFE0F eight-spoked asterisk|asterisk
\xA9\uFE0F copyright|copyright
\xAE\uFE0F registered|registered trademark
\u2122\uFE0F trade mark|trademark tm
\u{1F197} ok button|ok
\u{1F195} new button|new
\u{1F193} free button|free
\u{1F51D} top arrow|top
\u{1F4B2} heavy dollar sign|dollar money
\u{1F4B1} currency exchange|currency
\u{1F3C1} chequered flag|finish race
\u{1F6A9} triangular flag|flag red flag
\u{1F3F3}\uFE0F\u200D\u{1F308} rainbow flag|pride lgbt
\u{1F1EC}\u{1F1E7} flag united kingdom|uk britain england
\u{1F1FA}\u{1F1F8} flag united states|usa america
\u{1F1EA}\u{1F1FA} flag european union|eu europe
\u{1F1EB}\u{1F1F7} flag france|france
\u{1F1E9}\u{1F1EA} flag germany|germany
\u{1F1EE}\u{1F1F9} flag italy|italy
\u{1F1EA}\u{1F1F8} flag spain|spain
\u{1F1EF}\u{1F1F5} flag japan|japan
\u{1F1EE}\u{1F1F3} flag india|india
\u{1F1E8}\u{1F1E6} flag canada|canada
\u{1F1E6}\u{1F1FA} flag australia|australia`},Q=new Set,P=Object.entries(ee).flatMap(([r,e])=>e.trim().split(`
`).flatMap(t=>{let n=t.indexOf(" "),o=t.slice(0,n);if(Q.has(o))return[];Q.add(o);let[i,a=""]=t.slice(n+1).split("|");return[{char:o,name:i,keywords:a,group:r}]})),Ge=Object.keys(ee);function $e(r){let e=[];for(let t=0;t<r.length;t++){let n=r[t],o=r[t-1];/[\p{L}\p{N}]/u.test(n)&&(t===0||!/[\p{L}\p{N}]/u.test(o)||/\p{Lu}/u.test(n)&&/\p{Ll}/u.test(o)||/\p{N}/u.test(n)&&!/\p{N}/u.test(o))&&e.push(t)}return e}function B(r,e){return Array.from({length:e},(t,n)=>r+n)}function A(r,e,t,n){if(t===r)return{score:1e3,indices:B(0,r.length)};if(t.startsWith(r))return{score:900-Math.min(t.length-r.length,50),indices:B(0,r.length)};for(let m of n)if(m>0&&t.startsWith(r,m))return{score:800-Math.min(m,50),indices:B(m,r.length)};if(r.length>=2&&n.length>=r.length&&n.map(f=>t[f]).join("").startsWith(r))return{score:760,indices:n.slice(0,r.length)};let o=t.indexOf(r);if(o>=0)return{score:600-Math.min(o,50),indices:B(o,r.length)};if(r.length<2)return null;let i=new Set(n),a=[],c=300,u=0;for(let m=0;m<r.length;m++){let f=t.indexOf(r[m],u);if(f<0)return null;if(a.length){let d=f-a[a.length-1]-1;c+=d===0?12:-Math.min(d,10)*3}i.has(f)&&(c+=10),a.push(f),u=f+1}return c-=Math.min(a[0],20),a[a.length-1]-a[0]>r.length*4+6?null:{score:Math.max(c,100),indices:a}}function j(r,e){let t=r.trim().toLowerCase();if(!t)return{score:0,indices:[]};let n=e.toLowerCase(),o=$e(e),i=t.split(/\s+/);if(i.length===1)return A(t,e,n,o);let a=A(t,e,n,o);if(a&&a.score>=600)return a;let c=0,u=new Set;for(let m of i){let f=A(m,e,n,o);if(!f||f.score<500)return null;c+=f.score,f.indices.forEach(d=>u.add(d))}return{score:Math.round(c/i.length)-20,indices:[...u].sort((m,f)=>m-f)}}function te(r,e,t=[]){let n=j(r,e);for(let o of t){let i=j(r,o);i&&i.score>=600&&(!n||i.score-80>n.score)&&(n={score:i.score-80,indices:[]})}return n}var R={};function s(r,e,t,...n){for(let o of n)R[o]={category:r,factor:e,label:t}}s("length",.001,"mm","mm","millimeter","millimeters","millimetre","millimetres");s("length",.01,"cm","cm","centimeter","centimeters","centimetre","centimetres");s("length",1,"m","m","meter","meters","metre","metres");s("length",1e3,"km","km","kilometer","kilometers","kilometre","kilometres","k");s("length",.0254,"in","in","inch","inches",'"');s("length",.3048,"ft","ft","foot","feet","'");s("length",.9144,"yd","yd","yard","yards");s("length",1609.344,"mi","mi","mile","miles");s("length",1852,"nmi","nmi","nautical mile","nautical miles");s("mass",.001,"mg","mg","milligram","milligrams");s("mass",1,"g","g","gram","grams","gramme","grammes");s("mass",1e3,"kg","kg","kilo","kilos","kilogram","kilograms");s("mass",1e6,"t","t","tonne","tonnes","metric ton","metric tons");s("mass",28.349523125,"oz","oz","ounce","ounces");s("mass",453.59237,"lb","lb","lbs","pound","pounds");s("mass",6350.29318,"st","st","stone","stones");s("volume",1,"ml","ml","milliliter","milliliters","millilitre","millilitres");s("volume",10,"cl","cl","centiliter","centilitre");s("volume",1e3,"L","l","liter","liters","litre","litres");s("volume",4.92892,"tsp","tsp","teaspoon","teaspoons");s("volume",14.7868,"tbsp","tbsp","tablespoon","tablespoons");s("volume",240,"cup","cup","cups");s("volume",29.5735,"fl oz","floz","fl oz","fluid ounce","fluid ounces");s("volume",568.261,"pint (UK)","pint","pints","pt");s("volume",473.176,"pint (US)","us pint","us pints");s("volume",4546.09,"gal (UK)","gallon","gallons","gal","uk gallon");s("volume",3785.41,"gal (US)","us gallon","us gallons","us gal");s("speed",1,"m/s","m/s","mps","meters per second","metres per second");s("speed",1/3.6,"km/h","km/h","kmh","kph","kmph","kilometers per hour","kilometres per hour");s("speed",.44704,"mph","mph","miles per hour");s("speed",.514444,"kn","knot","knots","kn","kt");s("data",1/8,"bit","bit","bits");s("data",1,"B","b","byte","bytes");s("data",1e3,"KB","kb","kilobyte","kilobytes");s("data",1e6,"MB","mb","megabyte","megabytes");s("data",1e9,"GB","gb","gigabyte","gigabytes");s("data",1e12,"TB","tb","terabyte","terabytes");s("data",1024,"KiB","kib","kibibyte","kibibytes");s("data",1024**2,"MiB","mib","mebibyte","mebibytes");s("data",1024**3,"GiB","gib","gibibyte","gibibytes");s("data",1024**4,"TiB","tib","tebibyte","tebibytes");s("time",.001,"ms","ms","millisecond","milliseconds");s("time",1,"s","s","sec","secs","second","seconds");s("time",60,"min","min","mins","minute","minutes");s("time",3600,"h","h","hr","hrs","hour","hours");s("time",86400,"days","d","day","days");s("time",604800,"weeks","wk","week","weeks");s("time",31557600,"years","yr","yrs","year","years");s("area",1,"m\xB2","m2","m\xB2","sqm","square meter","square meters","square metre","square metres");s("area",.092903,"ft\xB2","ft2","ft\xB2","sqft","sq ft","square foot","square feet");s("area",1e6,"km\xB2","km2","km\xB2","square kilometer","square kilometers","square kilometre","square kilometres");s("area",258998811e-2,"mi\xB2","mi2","mi\xB2","sq mi","square mile","square miles");s("area",4046.8564,"acres","acre","acres","ac");s("area",1e4,"ha","ha","hectare","hectares");s("temperature",0,"\xB0C","c","\xB0c","celsius","centigrade","degc");s("temperature",0,"\xB0F","f","\xB0f","fahrenheit","degf");s("temperature",0,"K","kelvin","kelvins");function Ce(r,e){return e==="\xB0C"?r+273.15:e==="\xB0F"?(r-32)*(5/9)+273.15:r}function Te(r,e){return e==="\xB0C"?r-273.15:e==="\xB0F"?(r-273.15)*(9/5)+32:r}var Se={km:["mi"],mi:["km"],m:["ft","in"],cm:["in"],mm:["in"],in:["cm"],ft:["m"],yd:["m"],kg:["lb","st"],lb:["kg"],g:["oz"],oz:["g"],st:["kg"],"\xB0C":["\xB0F"],"\xB0F":["\xB0C"],K:["\xB0C"],L:["gal (US)","pint (UK)"],ml:["fl oz","cup"],cup:["ml"],"fl oz":["ml"],"gal (US)":["L"],"gal (UK)":["L"],"km/h":["mph"],mph:["km/h"],kn:["km/h"],GB:["GiB","MB"],MB:["KB"],TB:["GB"],GiB:["GB"],h:["min"],min:["s"],days:["h"],weeks:["days"],years:["days"],"m\xB2":["ft\xB2"],"ft\xB2":["m\xB2"],acres:["ha"],ha:["acres"]};function Le(r){return Object.values(R).find(e=>e.label===r)}function _(r){let e=r.trim().toLowerCase().replace(/^deg(?:rees?)?\s+/,"deg").replace(/\s+/g," ");return R[e]??R[e.replace(/^deg/,"")]??R[e.replace(/\.$/,"")]}var Ee={"\xB0C>\xB0F":"\xB0F = \xB0C \xD7 9/5 + 32","\xB0F>\xB0C":"\xB0C = (\xB0F \u2212 32) \xD7 5/9","\xB0C>K":"K = \xB0C + 273.15","K>\xB0C":"\xB0C = K \u2212 273.15","\xB0F>K":"K = (\xB0F \u2212 32) \xD7 5/9 + 273.15","K>\xB0F":"\xB0F = (K \u2212 273.15) \xD7 9/5 + 32"};function re(r,e){return r.category==="temperature"?Ee[`${r.label}>${e.label}`]??"":`1 ${r.label} = ${Number((r.factor/e.factor).toPrecision(6))} ${e.label}`}function ne(r,e,t){return e.category==="temperature"?Te(Ce(r,e.label),t.label):r*e.factor/t.factor}var oe=String.raw`(-?(?:\d[\d,]*\.?\d*|\.\d+))`,je=new RegExp(`^${oe}\\s*(.+?)\\s+(?:to|in|into|as|->|=)\\s+(.+?)\\??$`,"i"),Re=new RegExp(`^${oe}\\s*([^\\d].*?)$`,"i");function ie(r){let e=r.trim(),t=je.exec(e);if(t){let o=parseFloat(t[1].replace(/,/g,"")),i=_(t[2]),a=_(t[3]);return!i||!a||i.category!==a.category||Number.isNaN(o)?[]:[{from:i.label,to:a.label,input:o,value:ne(o,i,a),rate:re(i,a)}]}let n=Re.exec(e);if(n){let o=parseFloat(n[1].replace(/,/g,"")),i=_(n[2]);return!i||Number.isNaN(o)||n[2].trim().length<2?[]:(Se[i.label]??[]).flatMap(a=>{let c=Le(a);return c?[{from:i.label,to:c.label,input:o,value:ne(o,i,c),rate:re(i,c)}]:[]})}return[]}var I={clipboard:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',smile:'<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/>',timer:'<path d="M10 2h4M12 14l3-3"/><circle cx="12" cy="14" r="8"/>',lock:'<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',monitor:'<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/>',trash:'<path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',power:'<path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/>',globe:'<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',play:'<path d="M6 3l14 9-14 9V3z"/>',sparkle:'<path d="M12 3c.6 4.3 3.7 7.4 8 8-4.3.6-7.4 3.7-8 8-.6-4.3-3.7-7.4-8-8 4.3-.6 7.4-3.7 8-8Z"/>',arrow:'<path d="M5 12h14M12 5l7 7-7 7"/>',link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',type:'<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',code:'<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',back:'<path d="m12 19-7-7 7-7M19 12H5"/>'},ze={violet:"linear-gradient(135deg,#9b7bff,#6d4aff)",blue:"linear-gradient(135deg,#5ab0ff,#2f6fed)",green:"linear-gradient(135deg,#4ade80,#16a34a)",orange:"linear-gradient(135deg,#ffb057,#f06d1f)",red:"linear-gradient(135deg,#ff7a7a,#e0344b)",pink:"linear-gradient(135deg,#ff8fd0,#e6479b)",gray:"linear-gradient(135deg,#a1a1aa,#63636e)",teal:"linear-gradient(135deg,#4fe0d0,#0f9e9a)",yellow:"linear-gradient(135deg,#ffd84d,#f5a300)"};function v(r,e){return`<span class="d-ico" style="background:${ze[e]}"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${I[r]}</svg></span>`}function qe(r,e,t){return`<span class="d-ico" style="background:linear-gradient(135deg,${e},${t})"><b>${r}</b></span>`}function Be(r){return`<span class="d-ico d-swatch"><i style="background:${r}"></i></span>`}function k(r){return r.replace(/[&<>"]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[e])}var ae=[["Spotify","#1ed760","#169c46"],["Visual Studio Code","#3ea6ff","#0065a9"],["Google Chrome","#fbbc04","#ea4335"],["Discord","#8c9eff","#5865f2"],["Figma","#ff7262","#a259ff"],["Notion","#6b6b6b","#1f1f1f"],["Slack","#e01e5a","#611f69"],["Steam","#66c0f4","#1b2838"],["OBS Studio","#6b6b7b","#302e31"],["File Explorer","#ffd35c","#e8a300"],["Microsoft Word","#41a5ee","#185abd"],["Microsoft Excel","#33c481","#107c41"],["Microsoft PowerPoint","#ff8f6b","#c43e1c"],["Microsoft Teams","#7b83eb","#4b53bc"],["Notepad","#6cc4ff","#2b88d8"],["Calculator","#8a8a8a","#4a4a4a"],["Photos","#58b7ff","#1a73d9"],["Terminal","#4d4d4d","#1a1a1a"],["Paint","#ffb057","#e6479b"],["Blender","#ff9a3d","#e87d0d"],["Zoom","#4a8cff","#0b5cff"],["WhatsApp","#4ade80","#128c7e"],["Netflix","#ff4d57","#b20710"],["Minecraft Launcher","#7fbf4d","#4f7a28"]],se=[{title:"Clipboard History",subtitle:"Search and paste anything you\u2019ve copied",keywords:["paste","copy","clip"],icon:"clipboard",tint:"violet",run:"mode:clipboard"},{title:"Emoji Picker",subtitle:"Find an emoji and paste it \u2014 or type \u201C:\u201D",keywords:["emoji","smiley"],icon:"smile",tint:"yellow",run:"mode:emoji"},{title:"Start a Timer",subtitle:"Try \u201Ctimer 25m focus\u201D",keywords:["timer","countdown","pomodoro"],icon:"timer",tint:"orange",run:"query:timer "},{title:"Lock Screen",subtitle:"Lock your PC",keywords:["lock","away"],icon:"lock",tint:"blue",run:"toast:Your PC would lock now \u{1F512}"},{title:"Toggle Dark Mode",subtitle:"Switch Windows between light and dark",keywords:["dark mode","theme"],icon:"monitor",tint:"gray",run:"toast:Windows would switch themes \u{1F317}"},{title:"Sleep",subtitle:"Put your PC to sleep",keywords:["sleep","suspend"],icon:"moon",tint:"blue",run:"toast:Sweet dreams, PC \u{1F634}"},{title:"Shut Down",subtitle:"Turn off your PC",keywords:["shutdown","power off"],icon:"power",tint:"red",run:"toast:Shutting down \u2014 after you press \u21B5 again \u{1F44B}"},{title:"Empty Recycle Bin",subtitle:"Permanently delete everything in the bin",keywords:["trash","bin","clean"],icon:"trash",tint:"red",run:"toast:Recycle Bin emptied \u{1F9F9}"}],Fe=[{text:"https://github.com/phillipcurmei2-max/summon",icon:v("link","blue"),ago:"1 min ago"},{text:"#8B6DFF",icon:Be("#8B6DFF"),ago:"4 min ago"},{text:"Meeting moved to Thursday 3pm \u2014 same room, bring the Q3 numbers.",icon:v("type","gray"),ago:"12 min ago"},{text:"export function greet(name) {\n  return `Hello, ${name}!`\n}",icon:v("code","violet"),ago:"46 min ago"},{text:"Flat 4, 21 Baker Street, London NW1 6XE",icon:v("type","gray"),ago:"yesterday"}],Ne={yt:["YouTube","https://www.youtube.com/results?search_query=","play","red"],gh:["GitHub","https://github.com/search?q=","globe","gray"],wiki:["Wikipedia","https://en.wikipedia.org/w/index.php?search=","globe","gray"],maps:["Google Maps","https://www.google.com/maps/search/","globe","green"],ask:["Claude","https://claude.ai/new?q=","sparkle","orange"]};function Ue(r,e=[]){let t=new Set(e);return[...r].map((n,o)=>t.has(o)?`<em>${k(n)}</em>`:k(n)).join("")}function C(r,e,t,n,o){return`${r}<span class="d-title">${Ue(e,o)}</span>${t?`<span class="d-sub">${k(t)}</span>`:""}<span class="d-acc">${k(n)}</span>`}function F(r,e,t,n,o){return`<div class="d-card-side">${o?`<span class="d-bigswatch"><i style="background:${o}"></i></span>`:`<span class="d-big">${k(r)}</span>`}<small>${k(o?r:e)}</small></div><svg class="d-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${I.arrow}</svg><div class="d-card-side"><span class="d-big d-strong">${k(t)}</span><small>${k(n)}</small></div>`}function He(r){let e=[],t=r.trim();if(!t)return[{title:"Suggestions",rows:[...se.slice(0,3).map(d=>({html:C(v(d.icon,d.tint),d.title,d.subtitle,"Command"),primary:"Run Command",run:ce(d.run)})),...ae.slice(0,3).map(([d,b,T])=>le(d,b,T))]}];let n=Y(t);n&&e.push({title:"Timer",rows:[{html:F(O(n.ms),"Timer",n.label||"Time\u2019s up!","Notification"),primary:"Start Timer",run:{kind:"toast",text:`\u23F0 Timer set for ${O(n.ms)}${n.label?` \u2014 ${n.label}`:""}`}}]});let o=J(t);o&&e.push({title:"Calculator",rows:[{html:F(t,"Expression",o.text,"Result"),primary:"Copy Answer",run:{kind:"copy",text:X(o.value),label:o.text}}]});let i=ie(t);i.length&&e.push({title:"Conversion",rows:i.map(d=>{let b=z(Number(d.value.toPrecision(6)));return{html:F(`${z(d.input)} ${d.from}`,"Convert",`${b} ${d.to}`,d.rate),primary:"Copy Result",run:{kind:"copy",text:`${b} ${d.to}`,label:`${b} ${d.to}`}}})});let a=Z(t);a&&e.push({title:"Color",rows:[{html:F(a.hex,"HEX",a.rgb,a.hsl,a.hex),primary:"Copy HEX",run:{kind:"copy",text:a.hex,label:a.hex}}]});let c=[],u=/^(\S+)\s+(.+)$/.exec(t),m=u&&Ne[u[1].toLowerCase()];if(m&&u){let d=m[0]==="Claude"?`Ask Claude \u201C${u[2]}\u201D`:`Search ${m[0]} for \u201C${u[2]}\u201D`;c.push({score:3e3,html:C(v(m[2],m[3]),d,"","Web"),primary:"Open in Browser",run:{kind:"url",url:m[1]+encodeURIComponent(u[2])}})}for(let[d,b,T]of ae){let S=j(t,d);S&&c.push({score:S.score,...le(d,b,T,S.indices)})}for(let d of se){let b=te(t,d.title,d.keywords);b&&c.push({score:b.score-10,html:C(v(d.icon,d.tint),d.title,d.subtitle,"Command",b.indices),primary:"Run Command",run:ce(d.run)})}c.sort((d,b)=>b.score-d.score),c.length&&e.push({title:"Results",rows:c.slice(0,8)});let f=t.length>24?t.slice(0,23)+"\u2026":t;return e.push({title:`Use \u201C${f}\u201D with\u2026`,rows:[{html:C(v("globe","blue"),`Search Google for \u201C${t}\u201D`,"","Web"),primary:"Open in Browser",run:{kind:"url",url:"https://www.google.com/search?q="+encodeURIComponent(t)}},{html:C(v("sparkle","orange"),`Ask Claude \u201C${t}\u201D`,"","Web"),primary:"Open in Browser",run:{kind:"url",url:"https://claude.ai/new?q="+encodeURIComponent(t)}}]}),e}function le(r,e,t,n){return{html:C(qe(r[0],e,t),r,"","Application",n),primary:"Open Application",run:{kind:"toast",text:`\u{1F680} ${r} would open now`}}}function ce(r){let[e,...t]=r.split(":"),n=t.join(":");return e==="mode"?{kind:"mode",mode:n}:e==="query"?{kind:"query",q:n}:{kind:"toast",text:n}}function Oe(r){r.innerHTML=`
    <div class="d-head">
      <span class="d-lead"></span>
      <input class="d-input" spellcheck="false" autocomplete="off" aria-label="Try Summon \u2014 type something" />
      <span class="d-hint">try typing</span>
    </div>
    <div class="d-body" role="listbox"></div>
    <div class="d-foot">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><defs><linearGradient id="dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8f6bff"/><stop offset=".55" stop-color="#d94fd0"/><stop offset="1" stop-color="#ff8a3d"/></linearGradient></defs><rect x="1" y="1" width="22" height="22" rx="6.5" fill="url(#dg)"/><path d="M12 4.6c.55 3.9 2.9 6.25 6.8 6.8-3.9.55-6.25 2.9-6.8 6.8-.55-3.9-2.9-6.25-6.8-6.8 3.9-.55 6.25-2.9 6.8-6.8Z" fill="#fff"/></svg>
      <span class="d-status">Summon</span>
      <span class="d-primary"></span>
    </div>`;let e=r.querySelector(".d-input"),t=r.querySelector(".d-body"),n=r.querySelector(".d-lead"),o=r.querySelector(".d-status"),i=r.querySelector(".d-primary"),a=r.querySelector(".d-hint"),c="root",u=0,m=[],f=0,d=!0,b={root:"Search apps, commands, maths\u2026",emoji:"Search emoji\u2026",clipboard:"Search clipboard history\u2026"};function T(){let l=t.querySelector(".is-sel");if(!l)return;let p=l.getBoundingClientRect().top-t.getBoundingClientRect().top+t.scrollTop,h=p+l.offsetHeight;p<t.scrollTop?t.scrollTop=Math.max(0,p-36):h>t.scrollTop+t.clientHeight&&(t.scrollTop=h-t.clientHeight+8)}function S(l){o.textContent=l,o.classList.add("d-toast"),window.clearTimeout(f),f=window.setTimeout(()=>{o.textContent="Summon",o.classList.remove("d-toast")},2600)}function x(l,p=""){c=l,e.value=p,e.placeholder=b[l],n.innerHTML=l==="root"?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>':`<button class="d-back" aria-label="Back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${I.back}</svg></button><span class="d-chip">${l==="emoji"?"Emoji":"Clipboard History"}</span>`,n.querySelector(".d-back")?.addEventListener("click",()=>{L(),x("root"),e.focus()}),u=0,M()}function D(l){switch(l.kind){case"toast":return S(l.text);case"copy":return navigator.clipboard?.writeText(l.text).catch(()=>{}),S(`\u2713 Copied ${l.label}`);case"url":window.open(l.url,"_blank","noopener");return;case"mode":x(l.mode),e.focus();return;case"query":e.value=l.q,e.focus(),u=0,M()}}function M(){let l=e.value;if(c==="root"&&l.startsWith(":"))return x("emoji",l.slice(1));if(c==="emoji")return de(l);let p;if(c==="clipboard"){let g=l.trim().toLowerCase(),y=Fe.filter(w=>!g||w.text.toLowerCase().includes(g));p=[{title:g?`${y.length} match${y.length===1?"":"es"}`:"Recently copied",rows:y.map(w=>({html:C(w.icon,w.text.split(`
`)[0],"",w.ago),primary:"Paste to Active App",run:{kind:"copy",text:w.text,label:"to your clipboard"}}))}]}else p=He(l);m=p.flatMap(g=>g.rows),u>=m.length&&(u=Math.max(0,m.length-1));let h=0;t.innerHTML=p.filter(g=>g.rows.length).map(g=>`<div class="d-sec">${k(g.title)}</div>`+g.rows.map(y=>{let w=h++;return`<div class="${y.html.startsWith('<div class="d-card-side')?"d-card":"d-row"}${w===u?" is-sel":""}" data-i="${w}" role="option">${y.html}</div>`}).join("")).join(""),i.innerHTML=m[u]?`${k(m[u].primary)} <kbd>\u21B5</kbd>`:"",T()}let $=[];function de(l){let p=l.trim().toLowerCase();$=p?P.filter(h=>(j(p,h.name)?.score??0)>=500||h.keywords.split(" ").some(g=>g.startsWith(p))):P.slice(0,60),u>=$.length&&(u=Math.max(0,$.length-1)),t.innerHTML=$.length?`<div class="d-sec">${p?`${$.length} results`:"All emoji"}</div><div class="d-emoji">${$.map((h,g)=>`<button class="${g===u?"is-sel":""}" data-i="${g}" title="${k(h.name)}" tabindex="-1">${h.char}</button>`).join("")}</div>`:'<div class="d-empty">No emoji found</div>',m=$.map(h=>({html:"",primary:"Paste Emoji",run:{kind:"copy",text:h.char,label:`${h.char} ${h.name}`}})),i.innerHTML=m.length?"Paste Emoji <kbd>\u21B5</kbd>":"",o.textContent=o.classList.contains("d-toast")?o.textContent:$[u]?.name??"Emoji",T()}e.addEventListener("input",()=>{L(),u=0,M()}),e.addEventListener("keydown",l=>{L();let p=10,h=(g,y=!0)=>{l.preventDefault(),m.length&&(u=y?(u+g+m.length)%m.length:Math.max(0,Math.min(m.length-1,u+g)),M())};if(c==="emoji"&&l.key==="ArrowRight")return h(1,!1);if(c==="emoji"&&l.key==="ArrowLeft")return h(-1,!1);if(l.key==="ArrowDown")return h(c==="emoji"?p:1,c!=="emoji");if(l.key==="ArrowUp")return h(c==="emoji"?-p:-1,c!=="emoji");l.key==="Enter"?(l.preventDefault(),m[u]&&D(m[u].run)):l.key==="Escape"?(l.preventDefault(),c!=="root"?x("root"):(e.value="",M())):l.key==="Backspace"&&!e.value&&c!=="root"&&(l.preventDefault(),x("root"))}),t.addEventListener("click",l=>{let p=l.target.closest("[data-i]");p&&(L(),u=Number(p.dataset.i),M(),m[u]&&D(m[u].run))}),t.addEventListener("mousemove",l=>{let p=l.target.closest("[data-i]");if(!p||d)return;let h=Number(p.dataset.i);h!==u&&(u=h,M())}),r.addEventListener("pointerdown",()=>L());let K=["vsc","20% of 150 + 2^8","10 km to miles","timer 25m focus","#ff5c8a","yt lofi beats",":party","spot"],N=0;function L(){d&&(d=!1,window.clearTimeout(N),a.textContent="",r.classList.remove("is-auto"))}function me(l,p){let h=0,g=()=>{if(!d)return;h++;let y=l.slice(0,h);c!=="root"&&!y.startsWith(":")&&x("root"),c==="emoji"?e.value=y.slice(1):e.value=y,u=0,M(),N=window.setTimeout(h<l.length?g:p,h<l.length?55+Math.random()*60:2300)};g()}function W(l){d&&(x("root"),N=window.setTimeout(()=>me(K[l%K.length],()=>W(l+1)),350))}if(x("root"),window.matchMedia("(prefers-reduced-motion: reduce)").matches)L();else{r.classList.add("is-auto");let l=new IntersectionObserver(p=>{p.some(h=>h.isIntersecting)&&(l.disconnect(),W(0))});l.observe(r)}}var ue=document.getElementById("demo");ue&&Oe(ue);})();
