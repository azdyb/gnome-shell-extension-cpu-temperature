What is CPUTemperature?
========================

CPUTemperature is a GNOME Shell extension that adds an applet to the main panel, which shows current CPU temperature in Degree Celsius or Fahrenheit.


What it looks like?
===================

Everybody loves screenshots, right?

.. image:: http://img835.imageshack.us/img835/8341/cputemperature.png
   :alt: CPUTemperature


Disclaimer
==========

As I couldn't find any real documentation for writing gnome-shell extensions, I based my code on better or worse snippets and tutorials found on internet. Some of the sources are mentioned below:

* `gnome-shell-extensions <http://git.gnome.org/browse/gnome-shell-extensions/>`_
* `Musings of an OS plumber <http://blog.fpmurphy.com/tag/gnome-shell>`_

The project is based on Dipesh Acharya's original gnome-shell-extension-cpu-temperature_.
I rely on his file lists and parsing of lm_sensors output.

.. _gnome-shell-extension-cpu-temperature: http://github.com/xtranophilist/gnome-shell-extension-cpu-temperature


How it works?
=============

The extension scans a set of files in /proc and /sys to find current CPU temperature.
It falls back to lm_sensors if none of the predefined files is found.


Instalation
===========

The CPUTemperature@zdyb.tk directory should be copied to /usr/share/gnome-shell/extensions or ~/.local/share/gnome-shell/extensions/::

  # cp CPUTemperature\@zdyb.tk /usr/share/gnome-shell/extensions
  
or::

  $ cp CPUTemperature\@zdyb.tk ~/.local/share/gnome-shell/extensions/
  
Please do not forget to enable the newly installed extension using for example gnome-tweak-tool_.

.. _gnome-tweak-tool: http://live.gnome.org/GnomeTweakTool

License
=======

Copyright 2011 Aleksander Zdyb

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see http://www.gnu.org/licenses/.
