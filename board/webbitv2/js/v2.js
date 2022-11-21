class Burn {
  constructor() {
    this.espTool = new EspLoader({
      updateProgress: this.updateProgress,
      logMsg: this.logMsg,
      debugMsg: this.debugMsg
    });
  }

  async connect(baudrate) {
    await this.espTool.connect();
    this.readLoop().catch((error) => {
      console.log("err:", error);
    });
    try {
      if (await this.espTool.sync()) {
        this.logMsg("connected");
        this.logMsg("Connected to " + await this.espTool.chipName());
        this.logMsg("MAC Address: " + this.formatMacAddr(this.espTool.macAddr()));
        this.espTool = await this.espTool.runStub();
        await this.espTool.setBaudrate(baudrate);
      }
    } catch (e) {
      console.log("Error:", e);
      //await disconnect();
      return;
    }
  }

  async erase() {
    this.logMsg("Erasing flash memory. Please wait...");
    let stamp = Date.now();
    await this.espTool.eraseFlash();
    this.logMsg("Finished. Took " + (Date.now() - stamp) + "ms to erase.");
  }

  async flash(urlFiles) {
    var fileArr = [];
    for (var i = 0; i < urlFiles.length; i++) {
      var fileObj = await this.getFile(urlFiles[i][0], urlFiles[i][1]);
      fileArr.push(fileObj);
    }
    for (let file of fileArr) {
      let contents = file.data;
      let offset = file.address;
      await this.espTool.flashData(contents, offset, file);
      await this.sleep(100);
    }
    this.logMsg("To run the new firmware, please reset your device.");
  }

  async getFile(url, addrOffset) {
    return await fetch(url, {
      mode: 'cors'
    }).then(res => {
      return res.arrayBuffer();
    }).then(buf => {
      return { data: buf, address: addrOffset }
    });
  };

  updateProgress(part, percentage) {
    console.log("part:", part, " , percentage:", percentage);
  }

  logMsg(text) {
    console.log("log:", text);
  }

  debugMsg(debugLevel, ...args) {

  }

  formatMacAddr(macAddr) {
    return macAddr.map(value => value.toString(16).toUpperCase().padStart(2, "0")).join(":");
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async readLoop() {
    reader = port.readable.getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        reader.releaseLock();
        break;
      }
      inputBuffer = inputBuffer.concat(Array.from(value));
    }
  }

}

var burn = new Burn();

btnConnect.addEventListener('click', async () => {
  burn.connect(230400);
  btnJS.style['display'] = '';
  btnErase.style['display'] = '';
  btnPython.style['display'] = '';
});

btnErase.addEventListener('click', async () => {
  burn.erase();
});

btnPython.addEventListener('click', async () => {
  console.log("load files...");
  var fileArr = [
    ['board/webbitv2/0x1000_bootloader.bin', 0x1000],
    ['board/webbitv2/0x8000_partition-table.bin', 0x8000],
    ['board/webbitv2/0x10000_micropython.bin', 0x10000],
  ];
  console.log("OK!");
  burn.flash(fileArr);
});

btnJS.addEventListener('click', async () => {
  console.log("load files...");
  var fileArr = [
    ['board/webbitv2/0x1000_bootloader.bin', 0x1000],
    ['board/webbitv2/0x8000_partition-table.bin', 0x8000],
    ['board/webbitv2/bit_s2_default.bin', 0x10000],
  ];
  console.log("OK!");
  burn.flash(fileArr);
});