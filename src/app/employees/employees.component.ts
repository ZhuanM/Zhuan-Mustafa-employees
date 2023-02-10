import { Component } from '@angular/core';
import { FileData } from '../models/file.data';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent {
  public fileData: Array<FileData> = [];
  public displayedColumns: Array<string> = ['employeeId1', 'employeeId2', 'projectId', 'daysWorked'];
  public dataLoading: boolean = false;
  public noCombinationsFound: boolean = false;

  private readonly MILLISECONDS_IN_DAY: number  = 1000 * 3600 * 24;

  constructor() { }

  public uploadFile(event: any) {
    this.dataLoading = true;

    this.fileData = [];
    this.noCombinationsFound = false;

    let file: File = event.target.files[0];

    let reader: FileReader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      let csv: string = reader.result as string;
      let lines: Array<string> = csv.split("\n");

      for (let i = 1; i < lines.length; i++) {
        let currentLine: Array<string> = lines[i].split(",");

        // Current Employee
        let currentEmployeeId: string = currentLine[0];

        // Current Project
        let currentProjectId: string = currentLine[1];

        // DateFrom
        let currentDateFromArr: Array<string> = currentLine[2].split("-");
        let currentYearFrom: number = parseInt(currentDateFromArr[0]);
        let currentMonthFrom: number = parseInt(currentDateFromArr[1]) - 1;
        let currentDayFrom: number = parseInt(currentDateFromArr[2]);
        let currentDateFrom: Date = new Date(currentYearFrom, currentMonthFrom, currentDayFrom);

        // DateTo
        let currentDateToArr: Array<string> = currentLine[3].split("-");
        let currentYearTo: number = parseInt(currentDateToArr[0]);
        let currentMonthTo: number = parseInt(currentDateToArr[1]) - 1;
        let currentDayTo: number = parseInt(currentDateToArr[2]);
        let currentDateTo: Date = new Date(currentYearTo, currentMonthTo, currentDayTo);

        for (let j = i + 1; j < lines.length; j++) {
          let nextLine: Array<string> = lines[j].split(",");

          // Next Employee
          let nextEmployeeId: string = nextLine[0];

          // Next Project
          let nextProjectId: string = nextLine[1];

          // Next DateFrom
          let nextDateFromArr: Array<string> = nextLine[2].split("-");
          let nextYearFrom: number = parseInt(nextDateFromArr[0]);
          let nextMonthFrom: number = parseInt(nextDateFromArr[1]) - 1;
          let nextDayFrom: number = parseInt(nextDateFromArr[2]);
          let nextDateFrom: Date = new Date(nextYearFrom, nextMonthFrom, nextDayFrom);

          // Next DateTo
          let nextDateToArr: Array<string> = nextLine[3].split("-");
          let nextYearTo: number = parseInt(nextDateToArr[0]);
          let nextMonthTo: number = parseInt(nextDateToArr[1]) - 1;
          let nextDayTo: number = parseInt(nextDateToArr[2]);
          let nextDateTo: Date = new Date(nextYearTo, nextMonthTo, nextDayTo);

          if (currentEmployeeId !== nextEmployeeId && currentProjectId === nextProjectId) {
            let overlapStart: number = Math.max(currentDateFrom.getTime(), nextDateFrom.getTime());
            let overlapEnd: number = Math.min(currentDateTo.getTime(), nextDateTo.getTime());
            let overlapDays: number = Math.max(0, (overlapEnd - overlapStart) / this.MILLISECONDS_IN_DAY + 1);

            let newCombination: FileData = {
              employeeId1: currentEmployeeId,
              employeeId2: nextEmployeeId,
              projectId: currentProjectId,
              daysWorked: overlapDays
            };

            let existingCombination: FileData | undefined = this.fileData.find((combination) => {
              return (combination.employeeId1 === currentEmployeeId && combination.employeeId2 === nextEmployeeId) && combination.projectId === currentProjectId;
            });

            if (existingCombination) {
              existingCombination.daysWorked += newCombination.daysWorked;
            } else {
              this.fileData.push(newCombination);
            }
          }
        }
      }

      // Sort rows by days worked column
      this.fileData = this.fileData.sort((a, b) => {
        return b.daysWorked - a.daysWorked;
      });

      if (this.fileData.length == 0) {
        this.noCombinationsFound = true;
      }

      this.dataLoading = false;
    };
  }
}
