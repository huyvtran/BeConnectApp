import {Component} from '@angular/core';
import {IonicPage, LoadingController, NavController, NavParams, ToastController} from 'ionic-angular';
import {Events} from "../../providers/events/events";

@IonicPage()
@Component({
    selector: 'page-event-session-check-in-modal',
    templateUrl: 'event-session-check-in-modal.html',
})
export class EventSessionCheckInModalPage {
    check_in_count: number = 0;
    people_count: number = 0;

    churchSearch: any;
    churchSearchShouldShowCancel: boolean = true;

    event: any;
    items: any;
    subList: any = {
        status: true,
        people: [
            // {id: 0, event_id: 0, person_id: 0, name: "Hayao Miyazaki", check: true},
            // {id: 0, event_id: 0, person_id: 0, name: "Hayao Miyazaki", check: false},
            // {id: 0, event_id: 0, person_id: 0, name: "Hayao Miyazaki", check: true},
            // {id: 0, event_id: 0, person_id: 0, name: "Hayao Miyazaki", check: false},
        ]
    };

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public loadingCtrl: LoadingController,
                public toastCtrl: ToastController,
                public events: Events) {
        this.event = navParams.get('session');

        this.loadSub();
    }

    loadSub() {
        if (this.event) {
            let loading = this.loadingCtrl.create();
            loading.present();
            this.events.getSubList(this.event.id)
                .then((result: any) => {
                    loading.dismiss();

                    this.subList = result;
                    this.people_count = this.subList.people.length;
                    this.check_in_count = 0;

                    for (let person of this.subList.people) {
                        if (!person.imgProfile.startsWith('http')) {
                            person.imgProfile = 'https://beconnect.com.br/' + person.imgProfile;
                        }

                        if (person.check) {
                            this.check_in_count++;
                        }
                    }

                    this.setItems();
                })
                .catch((error: any) => {
                    loading.dismiss();
                    // this.toast.create({ message: 'Erro ao criar o usuário. Erro: ' + error.error, position: 'botton', duration: 3000 }).present();
                });
        }
    }

    save() {
        if (this.event) {
            let loading = this.loadingCtrl.create();
            loading.present();

            let checkList = [];

            for (let value of this.subList.people) {
                if (value.check) {
                    checkList.push(value.id);
                }
            }

            this.events.saveMassCheckin(checkList, this.event.id)
                .then((result: any) => {
                    loading.dismiss();

                    if (result.status) {
                        this.toastCtrl.create({
                            message: 'Check-in em massa salvo com sucesso!',
                            duration: 3000,
                            position: 'top'
                        }).present();
                        this.navCtrl.push('EventsPage');
                    } else {
                        this.toastCtrl.create({
                            message: result.msg,
                            duration: 3000,
                            position: 'top'
                        }).present();
                    }
                })
                .catch((error: any) => {
                    loading.dismiss();
                    // this.toast.create({ message: 'Erro ao criar o usuário. Erro: ' + error.error, position: 'botton', duration: 3000 }).present();
                });

        }
    }

    setItems() {
        this.items = this.subList.people;
    }

    onChurchSearchInput(ev: any) {
        this.setItems();
        let val = ev.target.value;

        if (val && val.trim() !== '') {
            this.items = this.items.filter(function (item) {
                return item.name.toLowerCase().includes(val.toLowerCase());
            });
        }
    }

    onChurchSearchCancel(ev: any) {
        this.setItems();
    }
}
