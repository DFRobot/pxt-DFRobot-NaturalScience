/**
 * This is a micro:bit-based expansion board.
 */
//% color="#AA278D" height=100 icon="\uf185" block="NaturalScience"
namespace NaturalScience {
    /**
    * TCS34725: Color recognition sensor related register variable definition
    */
    let TCS34725_ADDRESS = 0x29;
    let REG_TCS34725_ID = 0x12;
    let REG_TCS34725_COMMAND_BIT = 0x80;
    let REG_TCS34725_ENABLE = 0X00;
    let REG_TCS34725_ATIME = 0X01
    let REG_TCS34725_GAIN = 0x0F
    let REG_CLEAR_CHANNEL_L = 0X14;
    let REG_RED_CHANNEL_L = 0X16;
    let REG_GREEN_CHANNEL_L = 0X18;
    let REG_BLUE_CHANNEL_L = 0X1A;

    let TCS34275_POWER_ON = 0X01
    let TCS34725_ENABLE_AEN = 0X02
    let TCS34725_RGBC_C = 0;
    let TCS34725_RGBC_R = 0;
    let TCS34725_RGBC_G = 0;
    let TCS34725_RGBC_B = 0;
    let TCS34725_BEGIN = 0;
    let TCS34725_ENABLE_AIEN = 0X10;


    function getInt8LE(addr: number, reg: number): number {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(addr, NumberFormat.Int8LE);
    }

    function getUInt16LE(addr: number, reg: number): number {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(addr, NumberFormat.UInt16LE);
    }

    function getInt16LE(addr: number, reg: number): number {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(addr, NumberFormat.Int16LE);
    }

    /**
     * TCS34725 Color Sensor Init
     */
    function tcs34725_begin(): boolean {
        TCS34725_BEGIN = 0;
        let id = readReg(TCS34725_ADDRESS, REG_TCS34725_ID | REG_TCS34725_COMMAND_BIT);
        if ((id != 0x44) && (id != 0x10)) return false;
        TCS34725_BEGIN = 1;
        writeReg(TCS34725_ADDRESS, REG_TCS34725_ATIME | REG_TCS34725_COMMAND_BIT, 0xEB);
        writeReg(TCS34725_ADDRESS, REG_TCS34725_GAIN | REG_TCS34725_COMMAND_BIT, 0x01);
        writeReg(TCS34725_ADDRESS, REG_TCS34725_ENABLE | REG_TCS34725_COMMAND_BIT, 0x01);
        basic.pause(3);
        writeReg(TCS34725_ADDRESS, REG_TCS34725_ENABLE | REG_TCS34725_COMMAND_BIT, 0x01 | 0x02);
        return true;
    }

    function getRGBC() {
        if (!TCS34725_BEGIN) tcs34725_begin();

        TCS34725_RGBC_C = getUInt16LE(TCS34725_ADDRESS, REG_CLEAR_CHANNEL_L | REG_TCS34725_COMMAND_BIT);
        TCS34725_RGBC_R = getUInt16LE(TCS34725_ADDRESS, REG_RED_CHANNEL_L | REG_TCS34725_COMMAND_BIT);
        TCS34725_RGBC_G = getUInt16LE(TCS34725_ADDRESS, REG_GREEN_CHANNEL_L | REG_TCS34725_COMMAND_BIT);
        TCS34725_RGBC_B = getUInt16LE(TCS34725_ADDRESS, REG_BLUE_CHANNEL_L | REG_TCS34725_COMMAND_BIT);

        basic.pause(50);
        let ret = readReg(TCS34725_ADDRESS, REG_TCS34725_ENABLE | REG_TCS34725_COMMAND_BIT)
        ret |= TCS34725_ENABLE_AIEN;
        writeReg(TCS34725_ADDRESS, REG_TCS34725_ENABLE | REG_TCS34725_COMMAND_BIT, ret)
    }

    /**
     * Get the red value from the TCS34725 color sensor
     */
    //% block="get red"
    //% weight=60 
    export function getRed(): number {
        getRGBC();
        let red = (Math.round(TCS34725_RGBC_R) / Math.round(TCS34725_RGBC_C)) * 255;
        return Math.round(red);
    }

    /**
     * Get the green value from the TCS34725 color sensor
     */
    //% block="get green"
    //% weight=60 
    export function getGreen(): number {
        getRGBC();
        let green = (Math.round(TCS34725_RGBC_G) / Math.round(TCS34725_RGBC_C)) * 255;
        return Math.round(green);
    }

    /**
     * Get the blue value from the TCS34725 color sensor
     */
    //% block="get blue"
    //% weight=60 
    export function getBlue(): number {
        getRGBC();
        let blue = (Math.round(TCS34725_RGBC_B) / Math.round(TCS34725_RGBC_C)) * 255;
        return Math.round(blue)
    }

    /**
     *  Get the natural light value of the TCS34725 color sensor
     */
    //% block="get natural light"
    //% weight=60 
    export function getC(): number {
        getRGBC();
        return Math.round(TCS34725_RGBC_C);
    }

    /**
     * STM32  function
     */

    let STM32_ADDRESS = 0X1F;
    let STM32_PID = 0X01;
    let REG_STM32_VID = 0X02;
    let REG_SEM32_LED_CONTROL = 0X03;
    let REG_STM32_K_INTEGER = 0X04;
    let REG_SEM32_K_DECIMAL = 0X05;
    let REG_STM32_TDS_H = 0X06;
    let REG_SEM32_TDS_L = 0X07;
    let REG_SEM32_NOISE_H = 0X08;
    let REG_STM32_NOISE_L = 0X09;
    let REG_STM32_UV_H = 0X0A;
    let REG_SEM32_UV_L = 0X0B;

    export enum STM32_LED_STATUS {
        ON = 0X01,
        OFF = 0X00
    }

    function readReg(addr: number, reg: number): number {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
    }

    function writeReg(addr: number, reg: number, dat: number) {
        let buf = pins.createBuffer(2);
        buf[0] = reg;
        buf[1] = dat;
        pins.i2cWriteBuffer(addr, buf)
    }
    /**
     * LED switch
     */
    //% block="turn the Led %parms"
    //% weight=69
    export function setLed(parms: STM32_LED_STATUS) {
        writeReg(STM32_ADDRESS, REG_SEM32_LED_CONTROL, parms)
    }

    /**
     * Obtain the UV intensity of the UV sensor (mW/cm2)
     */
    //% block="get UV"
    //% weight=69
    export function getUV(): string {
        let ret1 = readReg(STM32_ADDRESS, REG_STM32_UV_H);
        let ret2 = readReg(STM32_ADDRESS, REG_SEM32_UV_L);
        let ret3 = ((ret1 << 8) | ret2);
        let ret4 = ret3 / 100
        let ret5 = ret3 % 100;
        let str = ".";
        if (ret5 < 10) {
            str += "0"
        }
        str = parseInt(ret4.toString()) + str + ret5;
        return str;
    }

    /**
     * Get the K value of the TDS sensor
     */
    //% block="get K"
    //% weight=70
    export function getK(): string {
        let ret1 = readReg(STM32_ADDRESS, REG_STM32_K_INTEGER);
        let ret2 = readReg(STM32_ADDRESS, REG_SEM32_K_DECIMAL);
        let str = ".";
        if (ret2 < 10) {
            str = str + '0';
        }
        str = ret1 + str + ret2;

        return str;
    }

    /**
     * Set the K value of the TDS sensor
     */
    //% block="set K to %value"
    //% weight=70 value.defl=2.68
    export function setK(value: number) {

        let ret1 = parseInt(value.toString());
        writeReg(STM32_ADDRESS, REG_STM32_K_INTEGER, ret1);
        let ret2 = (value * 100 - ret1 * 100);
        writeReg(STM32_ADDRESS, REG_SEM32_K_DECIMAL, ret2);
    }

    /**
     * Get the TDS value of the TDS sensor
     */
    //% block="get TDS"
    //% weight=70
    export function getTDS(): number {
        let ret1 = readReg(STM32_ADDRESS, REG_STM32_TDS_H);
        let ret2 = readReg(STM32_ADDRESS, REG_SEM32_TDS_L);
        let ret3 = (ret1 << 8) | ret2;
        if (ret3 > 2000) {
            ret3 = 0
        }
        return ret3;
    }

    /**
     * Get sound intensity
     */
    //% block="get sound intensity"
    //% weight=70
    export function getNoise(): number {
        let ret1 = readReg(STM32_ADDRESS, REG_SEM32_NOISE_H);
        let ret2 = readReg(STM32_ADDRESS, REG_STM32_NOISE_L);
        let x = Math.round((((ret1 << 8) | ret2) / 4096) * 1024);
        return x;
    }


    /**
     * BME280 Sensor
     */
    let BME280_I2C_ADDR = 0x76;

    let dig_T1 = getUInt16LE(BME280_I2C_ADDR, 0x88)
    let dig_T2 = getInt16LE(BME280_I2C_ADDR, 0x8A)
    let dig_T3 = getInt16LE(BME280_I2C_ADDR, 0x8C)
    let dig_P1 = getUInt16LE(BME280_I2C_ADDR, 0x8E)
    let dig_P2 = getInt16LE(BME280_I2C_ADDR, 0x90)
    let dig_P3 = getInt16LE(BME280_I2C_ADDR, 0x92)
    let dig_P4 = getInt16LE(BME280_I2C_ADDR, 0x94)
    let dig_P5 = getInt16LE(BME280_I2C_ADDR, 0x96)
    let dig_P6 = getInt16LE(BME280_I2C_ADDR, 0x98)
    let dig_P7 = getInt16LE(BME280_I2C_ADDR, 0x9A)
    let dig_P8 = getInt16LE(BME280_I2C_ADDR, 0x9C)
    let dig_P9 = getInt16LE(BME280_I2C_ADDR, 0x9E)
    let dig_H1 = readReg(BME280_I2C_ADDR, 0xA1)
    let dig_H2 = getInt16LE(BME280_I2C_ADDR, 0xE1)
    let dig_H3 = readReg(BME280_I2C_ADDR, 0xE3)
    let a = readReg(BME280_I2C_ADDR, 0xE5)
    let dig_H4 = (readReg(BME280_I2C_ADDR, 0xE4) << 4) + (a % 16)
    let dig_H5 = (readReg(BME280_I2C_ADDR, 0xE6) << 4) + (a >> 4)
    let dig_H6 = getInt8LE(BME280_I2C_ADDR, 0xE7)
    writeReg(BME280_I2C_ADDR, 0xF2, 0x04)
    writeReg(BME280_I2C_ADDR, 0xF4, 0x2F)
    writeReg(BME280_I2C_ADDR, 0xF5, 0x0C)
    let T = 0
    let P = 0
    let H = 0
    let POWER_ON = 0

    function get(): void {
        let adc_T = (readReg(BME280_I2C_ADDR, 0xFA) << 12) + (readReg(BME280_I2C_ADDR, 0xFB) << 4) + (readReg(BME280_I2C_ADDR, 0xFC) >> 4)
        let var1 = (((adc_T >> 3) - (dig_T1 << 1)) * dig_T2) >> 11
        let var2 = (((((adc_T >> 4) - dig_T1) * ((adc_T >> 4) - dig_T1)) >> 12) * dig_T3) >> 14
        let t = var1 + var2
        T = ((t * 5 + 128) >> 8);
        var1 = (t >> 1) - 64000
        var2 = (((var1 >> 2) * (var1 >> 2)) >> 11) * dig_P6
        var2 = var2 + ((var1 * dig_P5) << 1)
        var2 = (var2 >> 2) + (dig_P4 << 16)
        var1 = (((dig_P3 * ((var1 >> 2) * (var1 >> 2)) >> 13) >> 3) + (((dig_P2) * var1) >> 1)) >> 18
        var1 = ((32768 + var1) * dig_P1) >> 15
        if (var1 == 0)
            return; // avoid exception caused by division by zero
        let adc_P = (readReg(BME280_I2C_ADDR, 0xF7) << 12) + (readReg(BME280_I2C_ADDR, 0xF8) << 4) + (readReg(BME280_I2C_ADDR, 0xF9) >> 4)
        let _p = ((1048576 - adc_P) - (var2 >> 12)) * 3125
        _p = (_p / var1) * 2;
        var1 = (dig_P9 * (((_p >> 3) * (_p >> 3)) >> 13)) >> 12
        var2 = (((_p >> 2)) * dig_P8) >> 13
        P = _p + ((var1 + var2 + dig_P7) >> 4)
        let adc_H = (readReg(BME280_I2C_ADDR, 0xFD) << 8) + readReg(BME280_I2C_ADDR, 0xFE)
        var1 = t - 76800
        var2 = (((adc_H << 14) - (dig_H4 << 20) - (dig_H5 * var1)) + 16384) >> 15
        var1 = var2 * (((((((var1 * dig_H6) >> 10) * (((var1 * dig_H3) >> 11) + 32768)) >> 10) + 2097152) * dig_H2 + 8192) >> 14)
        var2 = var1 - (((((var1 >> 15) * (var1 >> 15)) >> 7) * dig_H1) >> 4)
        if (var2 < 0) var2 = 0
        if (var2 > 419430400) var2 = 419430400
        H = (var2 >> 12);
    }

    function powerOn() {
        writeReg(BME280_I2C_ADDR, 0xF4, 0x2F)
        POWER_ON = 1
    }

    export enum BME280Data {
        //% block="Pressure"
        Pressure,
        //% block="Temperature"
        Temperature,
        //% block="Humidity"
        Humidity
    }
    /**
     * Init display
     */
    //% weight=200
    //% block="init display"

    export function initDisplay(): void {
        cmd(0xAE);  // Set display OFF
        cmd(0xD5);  // Set Display Clock Divide Ratio / OSC Frequency 0xD4
        cmd(0x80);  // Display Clock Divide Ratio / OSC Frequency 
        cmd(0xA8);  // Set Multiplex Ratio
        cmd(0x3F);  // Multiplex Ratio for 128x64 (64-1)
        cmd(0xD3);  // Set Display Offset
        cmd(0x00);  // Display Offset
        cmd(0x40);  // Set Display Start Line
        cmd(0x8D);  // Set Charge Pump
        cmd(0x14);  // Charge Pump (0x10 External, 0x14 Internal DC/DC)
        cmd(0xA1);  // Set Segment Re-Map
        cmd(0xC8);  // Set Com Output Scan Direction
        cmd(0xDA);  // Set COM Hardware Configuration
        cmd(0x12);  // COM Hardware Configuration
        cmd(0x81);  // Set Contrast
        cmd(0xCF);  // Contrast
        cmd(0xD9);  // Set Pre-Charge Period
        cmd(0xF1);  // Set Pre-Charge Period (0x22 External, 0xF1 Internal)
        cmd(0xDB);  // Set VCOMH Deselect Level
        cmd(0x40);  // VCOMH Deselect Level
        cmd(0xA4);  // Set all pixels OFF
        cmd(0xA6);  // Set display not inverted
        cmd(0xAF);  // Set display On
        clear();
    }
    /**
     * Clear display
     */
    //% weight=85
    //% blockId=OLED_Clear
    //% block="clear display"
    export function clear() {
        //cmd(DISPLAY_OFF);   //display off
        for (let j = 0; j < 8; j++) {
            setText(j, 0);
            {
                for (let i = 0; i < 16; i++)  //clear all columns
                {
                    putChar(' ');
                }
            }
        }
        //cmd(DISPLAY_ON);    //display on
        setText(0, 0);
    }


    function setText(row: number, column: number) {
        let r = row;
        let c = column;
        if (row < 0) { r = 0 }
        if (column < 0) { c = 0 }
        if (row > 7) { r = 7 }
        if (column > 15) { c = 15 }

        cmd(0xB0 + r);            //set page address
        cmd(0x00 + (8 * c & 0x0F));  //set column lower address
        cmd(0x10 + ((8 * c >> 4) & 0x0F));   //set column higher address
    }


    function putChar(c: string) {
        let c1 = c.charCodeAt(0);
        writeCustomChar(basicFont[c1 - 32]);
    }
    /**
     * OLED 12864 shows the string
     */
    //% weight=90
    //% blockId=OLED_String
    //% text.defl="DFRobot"
    //% line.min=0 line.max=7
    //% block="OLED show text %text|on line %line"  
    export function showUserText(line: number, text: string) {

        setText(line, 0);
        for (let c of text) {
            putChar(c);
        }

        for (let i = text.length; i < 16; i++) {
            setText(line, i);
            putChar(" ");
        }
    }
	/**
     * OLED 12864 shows the number
     * @param line line num (8 pixels per line), eg: 0
     * @param n value , eg: 2019
     */
    //% weight=90
    //% blockId=OLED_number
    //% line.min=0 line.max=7
    //% block="OLED show number %n| on line %line"
    export function showUserNumber(line: number, n: number) {

        NaturalScience.showUserText(line, "" + n)
    }


    function writeCustomChar(c: string) {
        for (let i = 0; i < 8; i++) {
            writeData(c.charCodeAt(i));
        }
    }


    function cmd(c: number) {
        pins.i2cWriteNumber(0x3c, c, NumberFormat.UInt16BE);
    }


    function writeData(n: number) {
        let b = n;
        if (n < 0) { n = 0 }
        if (n > 255) { n = 255 }

        pins.i2cWriteNumber(0x3c, 0x4000 + b, NumberFormat.UInt16BE);
    }
    const DISPLAY_OFF = 0xAE;
    const DISPLAY_ON = 0xAF;
    const basicFont: string[] = [
        "\x00\x00\x00\x00\x00\x00\x00\x00", // " "
        "\x00\x00\x5F\x00\x00\x00\x00\x00", // "!"
        "\x00\x00\x07\x00\x07\x00\x00\x00", // """
        "\x00\x14\x7F\x14\x7F\x14\x00\x00", // "#"
        "\x00\x24\x2A\x7F\x2A\x12\x00\x00", // "$"
        "\x00\x23\x13\x08\x64\x62\x00\x00", // "%"
        "\x00\x36\x49\x55\x22\x50\x00\x00", // "&"
        "\x00\x00\x05\x03\x00\x00\x00\x00", // "'"
        "\x00\x1C\x22\x41\x00\x00\x00\x00", // "("
        "\x00\x41\x22\x1C\x00\x00\x00\x00", // ")"
        "\x00\x08\x2A\x1C\x2A\x08\x00\x00", // "*"
        "\x00\x08\x08\x3E\x08\x08\x00\x00", // "+"
        "\x00\xA0\x60\x00\x00\x00\x00\x00", // ","
        "\x00\x08\x08\x08\x08\x08\x00\x00", // "-"
        "\x00\x60\x60\x00\x00\x00\x00\x00", // "."
        "\x00\x20\x10\x08\x04\x02\x00\x00", // "/"
        "\x00\x3E\x51\x49\x45\x3E\x00\x00", // "0"
        "\x00\x00\x42\x7F\x40\x00\x00\x00", // "1"
        "\x00\x62\x51\x49\x49\x46\x00\x00", // "2"
        "\x00\x22\x41\x49\x49\x36\x00\x00", // "3"
        "\x00\x18\x14\x12\x7F\x10\x00\x00", // "4"
        "\x00\x27\x45\x45\x45\x39\x00\x00", // "5"
        "\x00\x3C\x4A\x49\x49\x30\x00\x00", // "6"
        "\x00\x01\x71\x09\x05\x03\x00\x00", // "7"
        "\x00\x36\x49\x49\x49\x36\x00\x00", // "8"
        "\x00\x06\x49\x49\x29\x1E\x00\x00", // "9"
        "\x00\x00\x36\x36\x00\x00\x00\x00", // ":"
        "\x00\x00\xAC\x6C\x00\x00\x00\x00", // ";"
        "\x00\x08\x14\x22\x41\x00\x00\x00", // "<"
        "\x00\x14\x14\x14\x14\x14\x00\x00", // "="
        "\x00\x41\x22\x14\x08\x00\x00\x00", // ">"
        "\x00\x02\x01\x51\x09\x06\x00\x00", // "?"
        "\x00\x32\x49\x79\x41\x3E\x00\x00", // "@"
        "\x00\x7E\x09\x09\x09\x7E\x00\x00", // "A"
        "\x00\x7F\x49\x49\x49\x36\x00\x00", // "B"
        "\x00\x3E\x41\x41\x41\x22\x00\x00", // "C"
        "\x00\x7F\x41\x41\x22\x1C\x00\x00", // "D"
        "\x00\x7F\x49\x49\x49\x41\x00\x00", // "E"
        "\x00\x7F\x09\x09\x09\x01\x00\x00", // "F"
        "\x00\x3E\x41\x41\x51\x72\x00\x00", // "G"
        "\x00\x7F\x08\x08\x08\x7F\x00\x00", // "H"
        "\x00\x41\x7F\x41\x00\x00\x00\x00", // "I"
        "\x00\x20\x40\x41\x3F\x01\x00\x00", // "J"
        "\x00\x7F\x08\x14\x22\x41\x00\x00", // "K"
        "\x00\x7F\x40\x40\x40\x40\x00\x00", // "L"
        "\x00\x7F\x02\x0C\x02\x7F\x00\x00", // "M"
        "\x00\x7F\x04\x08\x10\x7F\x00\x00", // "N"
        "\x00\x3E\x41\x41\x41\x3E\x00\x00", // "O"
        "\x00\x7F\x09\x09\x09\x06\x00\x00", // "P"
        "\x00\x3E\x41\x51\x21\x5E\x00\x00", // "Q"
        "\x00\x7F\x09\x19\x29\x46\x00\x00", // "R"
        "\x00\x26\x49\x49\x49\x32\x00\x00", // "S"
        "\x00\x01\x01\x7F\x01\x01\x00\x00", // "T"
        "\x00\x3F\x40\x40\x40\x3F\x00\x00", // "U"
        "\x00\x1F\x20\x40\x20\x1F\x00\x00", // "V"
        "\x00\x3F\x40\x38\x40\x3F\x00\x00", // "W"
        "\x00\x63\x14\x08\x14\x63\x00\x00", // "X"
        "\x00\x03\x04\x78\x04\x03\x00\x00", // "Y"
        "\x00\x61\x51\x49\x45\x43\x00\x00", // "Z"
        "\x00\x7F\x41\x41\x00\x00\x00\x00", // """
        "\x00\x02\x04\x08\x10\x20\x00\x00", // "\"
        "\x00\x41\x41\x7F\x00\x00\x00\x00", // """
        "\x00\x04\x02\x01\x02\x04\x00\x00", // "^"
        "\x00\x80\x80\x80\x80\x80\x00\x00", // "_"
        "\x00\x01\x02\x04\x00\x00\x00\x00", // "`"
        "\x00\x20\x54\x54\x54\x78\x00\x00", // "a"
        "\x00\x7F\x48\x44\x44\x38\x00\x00", // "b"
        "\x00\x38\x44\x44\x28\x00\x00\x00", // "c"
        "\x00\x38\x44\x44\x48\x7F\x00\x00", // "d"
        "\x00\x38\x54\x54\x54\x18\x00\x00", // "e"
        "\x00\x08\x7E\x09\x02\x00\x00\x00", // "f"
        "\x00\x18\xA4\xA4\xA4\x7C\x00\x00", // "g"
        "\x00\x7F\x08\x04\x04\x78\x00\x00", // "h"
        "\x00\x00\x7D\x00\x00\x00\x00\x00", // "i"
        "\x00\x80\x84\x7D\x00\x00\x00\x00", // "j"
        "\x00\x7F\x10\x28\x44\x00\x00\x00", // "k"
        "\x00\x41\x7F\x40\x00\x00\x00\x00", // "l"
        "\x00\x7C\x04\x18\x04\x78\x00\x00", // "m"
        "\x00\x7C\x08\x04\x7C\x00\x00\x00", // "n"
        "\x00\x38\x44\x44\x38\x00\x00\x00", // "o"
        "\x00\xFC\x24\x24\x18\x00\x00\x00", // "p"
        "\x00\x18\x24\x24\xFC\x00\x00\x00", // "q"
        "\x00\x00\x7C\x08\x04\x00\x00\x00", // "r"
        "\x00\x48\x54\x54\x24\x00\x00\x00", // "s"
        "\x00\x04\x7F\x44\x00\x00\x00\x00", // "t"
        "\x00\x3C\x40\x40\x7C\x00\x00\x00", // "u"
        "\x00\x1C\x20\x40\x20\x1C\x00\x00", // "v"
        "\x00\x3C\x40\x30\x40\x3C\x00\x00", // "w"
        "\x00\x44\x28\x10\x28\x44\x00\x00", // "x"
        "\x00\x1C\xA0\xA0\x7C\x00\x00\x00", // "y"
        "\x00\x44\x64\x54\x4C\x44\x00\x00", // "z"
        "\x00\x08\x36\x41\x00\x00\x00\x00", // "{"
        "\x00\x00\x7F\x00\x00\x00\x00\x00", // "|"
        "\x00\x41\x36\x08\x00\x00\x00\x00", // "}"
        "\x00\x02\x01\x01\x02\x01\x00\x00"  // "~"
    ];

    /**
     *  Get the pressure, temperature, and humidity of the BME280 sensor
     */
    //% block="get %data"
    //% weight=80
    export function readBME280Data(data: BME280Data): string {
        if (POWER_ON != 1) {
            powerOn()
        }
        get();
        let s = ".";
        let x;
        switch (data) {
            case 0: let ret1 = P / 1000;
                let ret2 = P % 1000;
                s = parseInt(ret1.toString()) + s + parseInt(ret2.toString());
                x = s.slice(0, 5)
                return x;
            case 1: let t1 = (T + 0) / 100 + 0;
                let t2 = (T + 0) % 100;
                s = parseInt(t1.toString()) + s + parseInt(t2.toString());
                x = s.slice(0, 5)
                return x;
            case 2: let h1 = H / 1024;
                let h2 = H % 1024;
                s = parseInt(h1.toString()) + s + parseInt(h2.toString());
                x = s.slice(0, 5)
                return x;
            default: return "0";
        }
    }


    //% shim=DS18B20::Temperature
    export function Temperature(p: number): number {
        // Fake function for simulator
        return 0
    }

    /**
     * Get the water temperature 
     */
    //% weight=80 blockId="get temp" 
    //% block="get tempN"
    export function TemperatureNumber(): number {
        // Fake function for simulator
        let x;
        let temp = Temperature(13);
        if (temp > 12500) {
            //temp = Temperature(13);
            //basic.pause(1);
            x = 0;
        } else {
            x = Math.round(temp / 100);
        }
        return x;
    }
}
