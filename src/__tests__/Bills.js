/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true); //Ajout de la mention expect
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      // const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const antiChrono = (a, b) => a - b; // correction [Bug report] - Bills
      const datesSorted = [...dates].sort(antiChrono);
      console.log(datesSorted);
      expect(dates).toEqual(datesSorted);
    });
  });

  describe("When I click on first eye icon", () => {
    test("Then modal should open", () => {
      //Ensuite, la modale devrait s'ouvrir
      Object.defineProperty(window, localStorage, { value: localStorageMock }); //simule des données dans le localstorage
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" })); //on simule en utilisateur connécter de type employé
      const html = BillsUI({ data: bills }); //création de la constante la modale facture de l'employé
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        //navigation vers la route bills
        document.body.innerHTML = ROUTES({ pathname });
      };

      const billsContainer = new Bills({
        //creation d'une facture
        document,
        onNavigate,
        localStorage: localStorageMock,
        store: null,
      });

      //MOCK de la modale
      $.fn.modal = jest.fn(); //affichage de la modale

      const handleClickIconEye = jest.fn(() => {
        //fonction qui simule un click
        billsContainer.handleClickIconEye;
      });
      const firstEyeIcon = screen.getAllByTestId("icon-eye")[0];
      firstEyeIcon.addEventListener("click", handleClickIconEye); //surveil un événement au click sur l'oeil
      fireEvent.click(firstEyeIcon); //click sur l'icone
      expect(handleClickIconEye).toHaveBeenCalled(); //vérifie si l'evenement au click a été appeler
      expect($.fn.modal).toHaveBeenCalled(); // vérifie si la modale est appeler
    });
  });

  // test naviagtion containers/Bills.js
  describe("When i click the button 'Nouvelle note de frais'", () => {
    //je clique sur le bouton nouvelle note de frais
    test("Then newbill appears", () => {
      // Vérifie qu'on arrive bien sur la page NewBill
      //J'intègre le chemin d'accès
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const billsPage = new Bills({
        document,
        onNavigate,
        store: null,
        bills: bills,
        localStorage: window.localStorage,
      });
      //création constante pour la fonction qui appel la fonction a tester
      const OpenNewBill = jest.fn(billsPage.handleClickNewBill);
      const btnNewBill = screen.getByTestId("btn-new-bill"); //cible le btn nouvelle note de frais
      btnNewBill.addEventListener("click", OpenNewBill); //écoute évènement
      fireEvent.click(btnNewBill); //simule évènement au click
      // on vérifie que la fonction est appelée et que la page souhaitée s'affiche
      expect(OpenNewBill).toHaveBeenCalled(); //je m'attends à ce que la page nouvelle note de frais se charge
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy(); //la nouvelle note de frais apparait avec le titre envoyer une note de frais
    });
  });

  // test d'integration get bill
  describe("When I get bills", () => {
    //Quand je demande de récupérer des factures
    test("Then it should render bills", async () => {
      //Ensuite, il devrait afficher les factures
      const bills = new Bills({
        //récupération des factures dans le store
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      const getBills = jest.fn(() => bills.getBills()); //simulation du click
      const value = await getBills(); //vérification
      expect(getBills).toHaveBeenCalled(); //on test si methode est utilisé
      expect(value.length).toBe(4); //test si la longeur du tableau est a 4 du store.js
    });
  });
});