#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
  #include <avr/power.h>
#endif

#define LED 27

// Parameter 1 = number of pixels in strip
// Parameter 2 = Arduino pin number (most are valid)
// Parameter 3 = pixel type flags, add together as needed:
//   NEO_KHZ800  800 KHz bitstream (most NeoPixel products w/WS2812 LEDs)
//   NEO_KHZ400  400 KHz (classic 'v1' (not v2) FLORA pixels, WS2811 drivers)
//   NEO_GRB     Pixels are wired for GRB bitstream (most NeoPixel products)
//   NEO_RGB     Pixels are wired for RGB bitstream (v1 FLORA pixels, not v2)
Adafruit_NeoPixel strip = Adafruit_NeoPixel(LED, 6, NEO_GRB + NEO_KHZ800);

// IMPORTANT: To reduce NeoPixel burnout risk, add 1000 uF capacitor across
// pixel power leads, add 300 - 500 Ohm resistor on first pixel's data input
// and minimize distance between Arduino and first pixel.  Avoid connecting
// on a live circuit...if you must, connect GND first.


struct current {
    int R = 255;
    int G = 0;
    int B = 0;
};

struct target {
    int R = 0;
    int G = 0;
    int B = 0;
};

current current;
target target;

void fadeColour(int, int, int);

void setup() {
  strip.begin();
  strip.show(); // Initialize all pixels to 'off'
}

void loop() {
	error(10);   //Flash Error lights 10 Times 
	delay(100);
	statusBar(); //For now, Increment every second - Will be controlled via %
	delay(30000); // Wait 30 seconds and repeat loop
}

// Fill the dots one after the other with a color
void colorWipe(uint32_t c, uint8_t wait) {
  for(uint16_t i=0; i<strip.numPixels(); i++) {
    strip.setPixelColor(i, c);
    strip.show();
    delay(wait);
  }
}

void error(uint8_t count) {
	for (uint16_t i=0; i <= count; i++){
		colorWipe(strip.Color(255, 0, 0), 0); //Set all Pixels to RED
		delay(50);
		colorWipe(strip.Color(0, 0, 0), 0);    //Set all Pixels to nothing 
		delay(50);
	}
}

void statusBar() {
	for (uint16_t i=0; i < 18; i++){
		strip.setPixelColor(i, strip.Color(0, 0, 200)); //Set Pixel to Blue
		strip.show();
		delay(1000);
	}
}

void fadeColour(int inR, int inG, int inB)
{
    target.R = inR;
    target.G = inG;
    target.B = inB;
    
    while((current.R != target.R) || (current.G != target.G) || (current.B != target.B)) // Runs until all current.RGB values are equal to target.RGB values
    {
        if(current.R > target.R)
        current.R -= 1;
        if(current.R < target.R)
        current.R += 1;
        
        if(current.B > target.B)
        current.B -= 1;
        if(current.B < target.B)
        current.B += 1;
        
        if(current.G > target.G)
        current.G -= 1;
        if(current.G < target.G)
        current.G += 1;     


        for (uint16_t i=0; i <= LED; i++){
          strip.setPixelColor(i, strip.Color(current.R, current.G, current.B));
          strip.show();
        }
        
        delay(10);

    }
    
}
