import { Component } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { ConfigService, AppService, BaseTabComponent } from 'terminus-core'
import { QuickCmds, ICmdGroup } from '../api'
import { TerminalTabComponent } from 'terminus-terminal';

@Component({
    template: require('./quickCmdsModal.component.pug'),
    styles: [require('./quickCmdsModal.component.scss')],
})
export class QuickCmdsModalComponent {
    cmds: QuickCmds[]
    childFolders: ICmdGroup[]
    quickCmd: string
    appendCR: boolean
    childGroups: ICmdGroup[]
    groupCollapsed: {[id: string]: boolean} = {}

    constructor (
        public modalInstance: NgbActiveModal,
        private config: ConfigService,
        private app: AppService,
    ) { }

    ngOnInit () {
        this.cmds = this.config.store.qc.cmds
        this.appendCR = true
        this.refresh()
    }

    quickSend () {
        this._send(this.app.activeTab, this.quickCmd + (this.appendCR ? "\n" : ""))
        this.close()
    }

    quickSendAll() {
        for (let tab of this.app.tabs) {
            this._send(tab, this.quickCmd + (this.appendCR ? "\n" : ""))
        }
        this.close()
    }

    _send (tab: BaseTabComponent, cmd: string) {
        if (tab instanceof TerminalTabComponent) {
            let currentTab = tab as TerminalTabComponent
            console.log("Sending " + cmd);
            currentTab.sendInput(cmd)
        }
    }

    close () {
        this.modalInstance.close()
    }

    send (cmd: QuickCmds, event: MouseEvent) {
        if (event.ctrlKey) {
            for (let tab of this.app.tabs) {
                this._send(tab, cmd.text + (cmd.appendCR ? "\n" : ""))
            } 
        }
        else {
            this._send(this.app.activeTab, cmd.text + (cmd.appendCR ? "\n" : "")) 
        }
        this.close()
    }

    refresh () {
        this.childGroups = []

        let cmds = this.cmds
        if (this.quickCmd) {
            cmds = cmds.filter(cmd => (cmd.name + cmd.group + cmd.text).toLowerCase().includes(this.quickCmd))
        }

        for (let cmd of cmds) {
            cmd.group = cmd.group || null
            let group = this.childGroups.find(x => x.name === cmd.group)
            if (!group) {
                group = {
                    name: cmd.group,
                    cmds: [],
                }
                this.childGroups.push(group)
            }
            group.cmds.push(cmd)
        }
    }
}
