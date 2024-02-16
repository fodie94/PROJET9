/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";

window.alert = jest.fn();
jest.mock("../app/Store", () => mockStore);

//gestion page employée
describe("Given I am connected as an employee", () => {
  //Étant donné que je suis connecté en tant qu'employé
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
    })
  );
  //Test d'intégration POST
  describe("Given I am a user connected as Employee", () => {
    // Etant donné que je suis un utilisateur connecté en tant que Salarié
    describe("When I submit the form completed", () => {
      // Lorsque je soumets le formulaire rempli
      test("Then the bill is created", async () => {
        // Ensuite, la facture est créée

        const html = NewBillUI();
        document.body.innerHTML = html;

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        // Simulation de la connexion de l employee
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "azerty@email.com",
          })
        );
        // Simulation de la création de la page de facture
        const newBill = new NewBill({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });

        const validBill = {
          type: "Vol",
          name: "Paris Lyon",
          date: "2022-10-25",
          amount: 60,
          vat: 70,
          pct: 30,
          commentary: "Commentary",
          fileUrl: "../img/0.jpg",
          fileName: "test.jpg",
          status: "pending",
        };

        // Charger les valeurs dans les champs
        screen.getByTestId("expense-type").value = validBill.type;
        screen.getByTestId("expense-name").value = validBill.name;
        screen.getByTestId("datepicker").value = validBill.date;
        screen.getByTestId("amount").value = validBill.amount;
        screen.getByTestId("vat").value = validBill.vat;
        screen.getByTestId("pct").value = validBill.pct;
        screen.getByTestId("commentary").value = validBill.commentary;

        newBill.fileName = validBill.fileName;
        newBill.fileUrl = validBill.fileUrl;

        newBill.updateBill = jest.fn(); // Simulation de click
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e)); // Envoi du formulaire

        const form = screen.getByTestId("form-new-bill");
        form.addEventListener("submit", handleSubmit); //surveil un événement au click sur l'oeil
        fireEvent.submit(form);

        expect(handleSubmit).toHaveBeenCalled(); // Vérification de l envoi du formulaire
        expect(newBill.updateBill).toHaveBeenCalled(); // Verifie si le formulaire est envoyé dans le store
      });
    });
  });

  describe("When i download the attached file in the correct format ", () => {
    //lorsque je telecharge le fichier joint dans le bon format
    test("Then the newbill is sent", () => {
      //mon champ est validé et ma NewBill est envoyé

      //je suis sur une nouvelle note de frais
      //j'integre le formulaire et le chemin d'accès
      const html = NewBillUI();
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        //je crée une nouvelle instance newbill
        document,
        onNavigate,
        store: mockStore,
        localStorage: window,
        localStorage,
      });
      //création constante pour fonction qui appel la fonction a tester
      const LoadFile = jest.fn((e) => newBill.handleChangeFile(e)); //chargement du fichier

      const fichier = screen.getByTestId("file"); //cible le champ fichier
      const testFormat = new File([" test"], "test.jpg", {
        //condition du test
        type: "image/jpg",
      });
      fichier.addEventListener("change", LoadFile); //écoute évènement
      fireEvent.change(fichier, { target: { files: [testFormat] } }); //évènement au change en relation avec la condition du test

      expect(LoadFile).toHaveBeenCalled(); //je vérifie que le fichier est bien chargé
      expect(fichier.files[0]).toStrictEqual(testFormat); //je vérifie que le fichier téléchargé est bien conforme à la condition du test

      const formNewBill = screen.getByTestId("form-new-bill"); //cible le formulaire
      expect(formNewBill).toBeTruthy();

      const sendNewBill = jest.fn((e) => newBill.handleSubmit(e)); //simule la fonction
      formNewBill.addEventListener("submit", sendNewBill); //évènement au submit
      fireEvent.submit(formNewBill); //simule l'évènement
      expect(sendNewBill).toHaveBeenCalled();
      expect(screen.getByText("Mes notes de frais")).toBeTruthy(); //lorsqu'on créer une nouvelle note de frais on verifie s'il est bien redirigé vers la page d'accueil
    });
  });

  describe("When i download the attached file in the wrong format", () => {
    //je telecharge le fichier dans un mauvais format
    test("Then i stay on the newbill and a message appears", () => {
      //Alors je reste sur la newbill et un message apparait

      const html = NewBillUI();
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window,
        localStorage,
      });
      const LoadFile = jest.fn((e) => newBill.handleChangeFile(e));
      const fichier = screen.getByTestId("file");
      const testFormat = new File(["test"], "document.txt", {
        type: "document/txt",
      });
      fichier.addEventListener("change", LoadFile);
      fireEvent.change(fichier, { target: { files: [testFormat] } });

      expect(LoadFile).toHaveBeenCalled();
      expect(window.alert).toBeTruthy();
    });
  });
});
