const St = imports.gi.St;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;

const ERROR_LABEL = "---";
const UPDATE_INTERVAL = 5000;
const SCALE = "C";
const cpu_temp_files = [
	'/sys/devices/platform/coretemp.0/temp1_input',
	'/sys/bus/acpi/devices/LNXTHERM\:00/thermal_zone/temp',
	'/sys/devices/virtual/thermal/thermal_zone0/temp',
	//old kernels with proc fs
	'/proc/acpi/thermal_zone/THM0/temperature',
	'/proc/acpi/thermal_zone/THRM/temperature',
	'/proc/acpi/thermal_zone/THR0/temperature',
	'/proc/acpi/thermal_zone/TZ0/temperature',
	'/sys/bus/acpi/drivers/ATK0110/ATK0110:00/hwmon/hwmon0/temp1_input',
	//hwmon for new 2.6.39, 3.0 linux kernels
	'/sys/class/hwmon/hwmon0/temp1_input',
	//Debian Sid/Experimental on AMD-64
	'/sys/class/hwmon/hwmon0/device/temp1_input'
];

let cpu_temp;

function CpuTemperature() {
    this._init.apply(this, arguments);
}

CpuTemperature.prototype = {
    __proto__: PanelMenu.Button.prototype,
	
	run: false,
	
    _init: function(){
        PanelMenu.Button.prototype._init.call(this, "temperature");
        this.build_ui();
		this.find_temperatures();
    },
	
	Run: function() {
		this.run = true;
		this.update_temperature();
		Mainloop.timeout_add(UPDATE_INTERVAL, Lang.bind(this, this.update_temperature));
	},
	
	Stop: function() {
		this.run = false;
	},
	
	build_ui: function() {
		this.statusLabel = new St.Label({ text: ERROR_LABEL, style_class: "temperature-label" });
		
		this.icon = new St.Icon({
			icon_type: St.IconType.SYMBOLIC,
			style_class: "popup-menu-icon",
			icon_name: "utilities-system-monitor"
		});
		
		this.box = new St.BoxLayout();
		
        this.box.add_actor(this.icon);
        this.box.add_actor(this.statusLabel);
        
		this.actor.add_actor(this.box);
	},
	
	find_temperatures: function() {
		for each (let file in cpu_temp_files) {
			if (GLib.file_test(file, GLib.FileTest.EXISTS)) {
				this.get_current_temperature = function () {
					let temperature = GLib.file_get_contents(file);
					if (temperature[0]) {
						return parseInt(temperature[1]) / 1000;
					} else
						return null;
				}
				return true;
			}
		}
		
		let ret = GLib.spawn_command_line_sync("which --skip-alias sensors");
		if ( (ret[0]) && (ret[3] == 0) ) {
			let sensors_path = ret[1].toString().split("\n", 1)[0];
			this.get_current_temperature = function() {
				let sensors = GLib.spawn_command_line_sync(sensors_path);
                if(sensors[0]) {
                    return this._findTemperatureFromSensorsOutput(sensors[1].toString());
				} else
					return null;
			}
			return true;
		}
		return false;
	},
	
	get_current_temperature: function() {
		return null;
	},
	
    update_temperature: function() {
		let current_temp = this.get_current_temperature();
		if (current_temp == null)
			this.statusLabel = ERROR_LABEL;
        else
			this.statusLabel.set_text(this.formatTemperature(current_temp));
		
		return this.run;
    },

	/**
	 * Original function by xtranophilist (Dipesh Acharya)
	 * https://github.com/xtranophilist/gnome-shell-extension-cpu-temperature
	 */
    _findTemperatureFromSensorsOutput: function(text){
        let senses_lines=text.split("\n");
        let line = '';
        let s=0;
        let n=0;
        //iterate through each lines
        for(var i = 0; i < senses_lines.length; i++) {
            line = senses_lines[i];
            //check for adapter
            if (this._isAdapter(line)){
                let type=line.substr(9,line.length-9);
                let c=0;
                switch (type){
                    case 'Virtual device':
                        //starting from the next line, loop, also increase the outer line counter i
                        for (var j=i+1;;j++,i++){
                            //continue only if line exists and isn't adapter
                            if(senses_lines[j] && !this._isAdapter(senses_lines[j])){
                                if(senses_lines[j].substr(0,5)=='temp1'){
                                    //remove all space characters
                                    senses_lines[j]=senses_lines[j].replace(/\s/g, "");
                                    s+=parseFloat(senses_lines[j].substr(7,4));
                                    n++;
                                    //set break flag on, look for temperature no-more
                                    c=1;    
                                };
                            }
                            else break;
                        }
                        break;
                    case 'ACPI interface':
                        //starting from the next line, loop, also increase the outer line counter i
                        for (var j=i+1;;j++,i++){
                            //continue only if line exists and isn't adapter
                            if(senses_lines[j] && !this._isAdapter(senses_lines[j])){
                                if(senses_lines[j].substr(0,15)=='CPU Temperature'){
                                    senses_lines[j]=senses_lines[j].replace(/\s/g, "");
                                    s+=parseFloat(senses_lines[j].substr(16,4));
                                    n++;
                                    //set break flag on, look for temperature no-more
                                    c=1;
                                };
                            }
                            else break;
                        }
                        break;
                    case 'ISA adapter':
                        //starting from the next line, loop, also increase the outer line counter i
                        for (var j=i+1;;j++,i++){
                            //continue only if line exists and isn't adapter
                            if(senses_lines[j] && !this._isAdapter(senses_lines[j])){
                                if(senses_lines[j].substr(0,4)=='Core'){
                                    senses_lines[j]=senses_lines[j].replace(/\s/g, "");
                                    s+=parseFloat(senses_lines[j].substr(7,4));
                                    n++;
                                };
                            }
                            else break;
                        }
                        break;
                    default:
                        break;
                }
                if (c==1) break;
            }
        }
        return(s/n);
    },

    _isAdapter: function(line){
        if(line.substr(0, 8)=='Adapter:') {
          return true;
        }
        return false;
    },

    _toFahrenheit: function(c){
        return ((9/5)*c+32).toFixed(1);
    },
	
	formatTemperature: function(temp_celsius) {
		// TODO: Get scale from locale (Celsius or Fahrenheit)
		if (SCALE == "F") temp_celsius = this._toFahrenheit(temp_celsius);
		return temp_celsius.toString() + " \u00b0" + SCALE;
	}
}

function init(extensionMeta) {
	cpu_temp = new CpuTemperature();
    Main.panel._rightBox.insert_actor(cpu_temp.actor, 0);
	Main.panel._menus.addMenu(cpu_temp.menu);
}


function enable() {
	cpu_temp.actor.show();
	cpu_temp.Run();
}

function disable() {
	cpu_temp.actor.hide();
	cpu_temp.Stop();
}

