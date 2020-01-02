# MBT0013 micronatural & science 

This is a microbit-based theme expansion board. The theme is natural science. Through the vivid logo and interesting theme features, the expansion board becomes a knowledgeable and interesting multimedia teaching tool. In the teaching process, it is very easy to transition from the natural environment knowledge point to the knowledge detection, program programming and other knowledge points.

[Expansion board configuration: atmospheric pressure, temperature, humidity, color, sound, light, water quality, OLED screen as data display, using makecode graphical programming](https://www.dfrobot.com/product-1948.html?search=MBT0013&description=true)


## Basic usage

* Initializes the display, showing DFRobot on the first line and 2019 on the second line.

```blocks
NaturalScience.initDisplay()
basic.forever(function () {
    NaturalScience.showUserText(0, "DFRobot")
    NaturalScience.showUserNumber(1, 2019)
    basic.pause(1000)
    NaturalScience.clear()
    basic.pause(1000)
})
```

* Serial print atmospheric pressure, ambient temperature, ambient humidity

```blocks
basic.forever(function () {
    serial.writeString(NaturalScience.readBME280Data(NaturalScience.BME280Data.Pressure))
    serial.writeString(NaturalScience.readBME280Data(NaturalScience.BME280Data.Temperature))
    serial.writeString(NaturalScience.readBME280Data(NaturalScience.BME280Data.Humidity))
})

```

* Serial print temperature, sound intensity, uv intensity
```blocks
basic.forever(function () {
    serial.writeString("" + NaturalScience.TemperatureNumber())
    serial.writeString("" + NaturalScience.getNoise())
    serial.writeString(NaturalScience.getUV())
})
```

* Serial print color recognition sensor red value, blue value, green value, natural light

```blocks
basic.forever(function () {
    serial.writeString("" + NaturalScience.getRed())
    serial.writeString("" + NaturalScience.getGreen())
    serial.writeString("" + NaturalScience.getBlue())
    serial.writeString("" + NaturalScience.getC())
})
```

* LED lamp switch

```blocks
basic.forever(function () {
    NaturalScience.setLed(NaturalScience.STM32_LED_STATUS.ON)
    basic.pause(1000)
    NaturalScience.setLed(NaturalScience.STM32_LED_STATUS.OFF)
    basic.pause(1000)
})
```

* Serial port printing TDS (PPM), TDS electrode constant

```blocks
NaturalScience.setK(2.68)
basic.forever(function () {
    serial.writeString(NaturalScience.getK())
    serial.writeString("" + NaturalScience.getTDS())
})
```

## License

MIT

Copyright (c) 2020, microbit/micropython Chinese community  


## Supported targets

* for PXT/microbit
(The metadata above is needed for package search.)

