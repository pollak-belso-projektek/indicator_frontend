import { Table } from "@chakra-ui/react";

export default function Kompetencia() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();

  const currentYear = month >= 9 ? year : year - 1;

  const years = [
    currentYear - 3,
    currentYear - 2,
    currentYear - 1,
    currentYear,
  ];

  const data = {};

  years.map((e) => {
    data[e] = {
      matematika: {
        technikum: {
          intezmenyi: 22,
          orszagos: 2,
        },
        szakkepzo: {
          intezmenyi: 22,
          orszagos: 2,
        },
      },
      szovegertes: {
        technikum: {
          intezmenyi: 22,
          orszagos: 2,
        },
        szakkepzo: {
          intezmenyi: 22,
          orszagos: 2,
        },
      },
    };
  });

  return (
    <Table.Root size="md" showColumnBorder variant="outline">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader rowSpan={3}>Verseny típusa</Table.ColumnHeader>
          <Table.ColumnHeader rowSpan={3}>Verseny Neve</Table.ColumnHeader>
          {years.map((e) => {
            return <Table.ColumnHeader colSpan={4}>{e}</Table.ColumnHeader>;
          })}
        </Table.Row>
        <Table.Row>
          {years.map(() => {
            return (
              <>
                <Table.ColumnHeader>1. helyezés</Table.ColumnHeader>
                <Table.ColumnHeader>1-3. helyezés</Table.ColumnHeader>
                <Table.ColumnHeader>
                  1-10. helyezés /döntőbe jutás
                </Table.ColumnHeader>
                <Table.ColumnHeader>
                  Versenyre nevezettek száma
                </Table.ColumnHeader>
              </>
            );
          })}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell></Table.Cell>
          <Table.Cell></Table.Cell>
          <Table.Cell>(fő)</Table.Cell>
          <Table.Cell>(fő)</Table.Cell>
          <Table.Cell>(fő)</Table.Cell>
          <Table.Cell>(fő)</Table.Cell>
          <Table.Cell>(fő)</Table.Cell>
          <Table.Cell>(fő)</Table.Cell>
          <Table.Cell>(fő)</Table.Cell>
          <Table.Cell>(fő)</Table.Cell>
          <Table.Cell>(fő)</Table.Cell>
          <Table.Cell>(fő)</Table.Cell>
          <Table.Cell>(fő)</Table.Cell>
          <Table.Cell>(fő)</Table.Cell>
          <Table.Cell>(fő)</Table.Cell>
          <Table.Cell>(fő)</Table.Cell>
          <Table.Cell>(fő)</Table.Cell>
          <Table.Cell>(fő)</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell rowSpan={2}>Nemzetközi szakmai verseny</Table.Cell>
          <Table.Cell>WorldSkills</Table.Cell>
          {years.map((e) => {
            return (
              <>
                <Table.Cell>{data[e].matematika.technikum.orszagos}</Table.Cell>
                <Table.Cell>
                  {data[e].matematika.technikum.intezmenyi}
                </Table.Cell>
              </>
            );
          })}
        </Table.Row>
        <Table.Row>
          <Table.Cell>Euroskills </Table.Cell>
          {years.map((e) => {
            return (
              <>
                <Table.Cell>
                  {data[e].szovegertes.technikum.orszagos}
                </Table.Cell>
                <Table.Cell>
                  {data[e].szovegertes.technikum.intezmenyi}
                </Table.Cell>
              </>
            );
          })}
        </Table.Row>
        <Table.Row>
          <Table.Cell>Nemzetközi közismeretei verseny </Table.Cell>

          <Table.Cell rowSpan={2}></Table.Cell>
          {years.map((e) => {
            return (
              <>
                <Table.Cell>{data[e].matematika.szakkepzo.orszagos}</Table.Cell>
                <Table.Cell>
                  {data[e].matematika.szakkepzo.intezmenyi}
                </Table.Cell>
              </>
            );
          })}
        </Table.Row>
        <Table.Row>
          <Table.Cell>Nemzetközi sportverseny </Table.Cell>
          {years.map((e) => {
            return (
              <>
                <Table.Cell>
                  {data[e].szovegertes.szakkepzo.orszagos}
                </Table.Cell>
                <Table.Cell>
                  {data[e].szovegertes.szakkepzo.intezmenyi}
                </Table.Cell>
              </>
            );
          })}
        </Table.Row>
        <Table.Row>
          <Table.Cell rowSpan={4}>Nemzetközi sportverseny </Table.Cell>
          <Table.Cell>SZKTV </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>SZÉTV </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>OSZTV </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>egyéb országos szakmai versenyek </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell colSpan={2}>
            Regionális, vármegyei szakmai tanulmányi verseny
          </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
        </Table.Row>

        <Table.Row>
          <Table.Cell rowSpan={6}>
            Országos Közismereti Tanulmányi Verseny
          </Table.Cell>
          <Table.Cell>OKTV </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>OSZKTV </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Implom József helyesírási verseny </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Nemzetközi Kenguru Matematika Verseny </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Zrínyi Ilona Matematikaverseny </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>egyéb országos közismereti tanulmányi verseny</Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell colSpan={2}>
            Regionális, vármegyei közismereti tanulmányi verseny
          </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            Emlékévhez kapcsolódó országos műveltségi versenyek
          </Table.Cell>
          <Table.Cell>
            {" "}
            (jogszabályban megfogalmazott emlékév-pl. Petőfi 200){" "}
          </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell rowSpan={2}>Hazai országos sportversenyek</Table.Cell>
          <Table.Cell>Diákolimpia</Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Országos sportverseny</Table.Cell>
          <Table.Cell></Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Hazai, vármegyei sportversenyek </Table.Cell>
          <Table.Cell></Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Összesen</Table.Cell>
          <Table.Cell></Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>Tanulói jogviszonyban álló tanulók száma (fő)</Table.Cell>
          <Table.Cell></Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
          <Table.Cell> </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
}