#!/bin/bash
ssh fresh_install cd $CHORUS_HOME && chorus_control backup -d backups
ssh fresh_install cd $CHORUS_HOME && chorus_control restore backups/*.tar

